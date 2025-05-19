import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

// Define custom element types for Slate
export type SlateElementType = 
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'heading-three'
  | 'blockquote'
  | 'code-block'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item'
  | 'link';

export interface SlateCustomElement {
  type: SlateElementType;
  url?: string;
  children: SlateCustomText[];
}

export interface SlateCustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
}

export type ViewMode = 'split' | 'original' | 'clean';

// Extend the Slate editor types
export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: SlateCustomElement;
    Text: SlateCustomText;
  }
}