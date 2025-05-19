import { Editor, Transforms, Range, Element as SlateElement, Point } from "slate";
import { ReactEditor } from "slate-react";

// Slate plugin to handle keyboard shortcuts for formatting
export const withShortcuts = (editor: Editor) => {
  const { deleteBackward, insertText } = editor;

  // Handle markdown-style shortcuts
  editor.insertText = (text) => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);

      // Handle different markdown shortcuts
      switch (beforeText) {
        case '#': {
          Transforms.delete(editor, { at: range });
          Transforms.setNodes(
            editor,
            { type: 'heading-one' },
            { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
          );
          return;
        }
        case '##': {
          Transforms.delete(editor, { at: range });
          Transforms.setNodes(
            editor,
            { type: 'heading-two' },
            { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
          );
          return;
        }
        case '###': {
          Transforms.delete(editor, { at: range });
          Transforms.setNodes(
            editor,
            { type: 'heading-three' },
            { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
          );
          return;
        }
        case '-':
        case '*': {
          Transforms.delete(editor, { at: range });
          Transforms.setNodes(
            editor,
            { type: 'list-item' },
            { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
          );
          Transforms.wrapNodes(
            editor,
            { type: 'bulleted-list', children: [] },
            { match: n => SlateElement.isElement(n) && n.type === 'list-item' }
          );
          return;
        }
        case '1.': {
          Transforms.delete(editor, { at: range });
          Transforms.setNodes(
            editor,
            { type: 'list-item' },
            { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
          );
          Transforms.wrapNodes(
            editor,
            { type: 'numbered-list', children: [] },
            { match: n => SlateElement.isElement(n) && n.type === 'list-item' }
          );
          return;
        }
        case '>': {
          Transforms.delete(editor, { at: range });
          Transforms.setNodes(
            editor,
            { type: 'blockquote' },
            { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
          );
          return;
        }
        case '```': {
          Transforms.delete(editor, { at: range });
          Transforms.setNodes(
            editor,
            { type: 'code-block' },
            { match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
          );
          return;
        }
      }
    }

    insertText(text);
  };

  // Handle deleting empty blocks
  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: 'paragraph' });
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};

// Plugin to handle links in the editor
export const withLinks = (editor: Editor) => {
  const { isInline } = editor;

  editor.isInline = (element) => {
    return element.type === 'link' ? true : isInline(element);
  };

  return editor;
};
