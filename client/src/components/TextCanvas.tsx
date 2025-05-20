import { useState, useCallback } from "react";
import { createEditor, Descendant, Editor, Transforms, Element as SlateElement } from "slate";
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from "slate-react";
import { withHistory } from "slate-history";
import DetectorGauge from "@/components/DetectorGauge";
import ClipboardBridge from "@/components/ClipboardBridge";
import FileGateway from "@/components/FileGateway";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEditorContext } from "@/contexts/EditorContext";
import { applyTransformations } from "@/lib/TransformationEngine";
import { SlateCustomElement, SlateCustomText, ViewMode } from "@/lib/editor/slateTypes";
import { withShortcuts, withLinks } from "@/lib/editor/slatePlugins";

export default function TextCanvas() {
  // Create our editors
  const [originalEditor] = useState(() => withLinks(withShortcuts(withHistory(withReact(createEditor())))));
  const [cleanedEditor] = useState(() => withLinks(withShortcuts(withHistory(withReact(createEditor())))));
  
  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  
  // Get global state from context
  const { 
    activeRules, 
    originalValue, 
    cleanedValue, 
    setOriginalValue, 
    setCleanedValue 
  } = useEditorContext();
  
  const { toast } = useToast();

  // Transform the original content whenever it changes or rules change
  const transformContent = useCallback((value: Descendant[]) => {
    try {
      // Add default rules if none are active
      let rulesToApply = activeRules;
      if (activeRules.length === 0) {
        rulesToApply = ["rule-1", "rule-2", "rule-3", "rule-4"];
      }
      
      // Apply transformation rules to the original value
      const transformedValue = applyTransformations(value, rulesToApply);
      setCleanedValue(transformedValue);
      
      // Count words and characters
      const plainText = Editor.string(originalEditor, []);
      setWordCount(plainText.trim().split(/\s+/).filter(Boolean).length);
      setCharCount(plainText.length);
    } catch (error) {
      console.error("Error transforming content:", error);
      toast({
        title: "Error",
        description: "Failed to transform content. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeRules, originalEditor, setCleanedValue, toast]);

  const handleOriginalValueChange = useCallback((value: Descendant[]) => {
    setOriginalValue(value);
    transformContent(value);
  }, [setOriginalValue, transformContent]);

  // Define custom rendering functions
  const renderElement = useCallback((props: RenderElementProps) => {
    const { attributes, children, element } = props;
    
    switch ((element as SlateCustomElement).type) {
      case 'heading-one':
        return <h1 className="text-2xl font-bold mb-4" {...attributes}>{children}</h1>;
      case 'heading-two':
        return <h2 className="text-xl font-bold mb-4" {...attributes}>{children}</h2>;
      case 'heading-three':
        return <h3 className="text-lg font-bold mb-3" {...attributes}>{children}</h3>;
      case 'bulleted-list':
        return <ul className="list-disc pl-5 mb-3" {...attributes}>{children}</ul>;
      case 'numbered-list':
        return <ol className="list-decimal pl-5 mb-3" {...attributes}>{children}</ol>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'link':
        return (
          <a 
            {...attributes}
            href={(element as SlateCustomElement & { url: string }).url}
            className="text-primary-600 underline"
          >
            {children}
          </a>
        );
      default:
        return <p className="mb-3" {...attributes}>{children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const { attributes, children, leaf } = props;
    let leafChildren = children;
    
    if ((leaf as SlateCustomText).bold) {
      leafChildren = <strong>{leafChildren}</strong>;
    }
    
    if ((leaf as SlateCustomText).italic) {
      leafChildren = <em>{leafChildren}</em>;
    }
    
    if ((leaf as SlateCustomText).underline) {
      leafChildren = <u>{leafChildren}</u>;
    }
    
    if ((leaf as SlateCustomText).code) {
      leafChildren = <code className="bg-gray-100 px-1 py-0.5 rounded text-secondary-700 font-mono text-sm">{leafChildren}</code>;
    }
    
    return <span {...attributes}>{leafChildren}</span>;
  }, []);

  // Toolbar button handlers
  const handleFormat = useCallback((format: string) => {
    if (['bold', 'italic', 'underline', 'code'].includes(format)) {
      Editor.addMark(originalEditor, format, true);
    }
  }, [originalEditor]);

  const handleBlockFormat = useCallback((format: string) => {
    // Get the current selection
    const { selection } = originalEditor;
    if (!selection) return;
    
    // Determine the nodes at the current selection
    const [match] = Editor.nodes(originalEditor, {
      match: n => SlateElement.isElement(n) && n.type === format,
    });
    
    // Toggle the block type
    Transforms.setNodes(
      originalEditor,
      { type: match ? 'paragraph' : format },
      { match: n => SlateElement.isElement(n) && Editor.isBlock(originalEditor, n) }
    );
  }, [originalEditor]);

  const handleHeadingFormat = useCallback((format: string) => {
    // Get the current selection
    const { selection } = originalEditor;
    if (!selection) return;
    
    // Determine the nodes at the current selection
    const [match] = Editor.nodes(originalEditor, {
      match: n => SlateElement.isElement(n) && ['heading-one', 'heading-two', 'heading-three'].includes(n.type as string),
    });
    
    // Toggle the block type
    Transforms.setNodes(
      originalEditor,
      { type: match ? 'paragraph' : format },
      { match: n => SlateElement.isElement(n) && Editor.isBlock(originalEditor, n) }
    );
  }, [originalEditor]);

  const handleUndo = useCallback(() => {
    originalEditor.undo();
  }, [originalEditor]);
  
  const handleRedo = useCallback(() => {
    originalEditor.redo();
  }, [originalEditor]);

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* File Controls */}
        <div className="mb-4 flex flex-wrap gap-2">
          <FileGateway onImport={handleOriginalValueChange} />
          <div className="flex-grow"></div>
          <div className="inline-flex text-sm bg-white border border-gray-300 rounded-md overflow-hidden">
            <Button 
              variant="ghost"
              size="sm"
              className="px-3 py-2 border-r border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={handleUndo}
            >
              <i className="ri-arrow-go-back-line"></i>
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="px-3 py-2 text-gray-700 hover:bg-gray-50"
              onClick={handleRedo}
            >
              <i className="ri-arrow-go-forward-line"></i>
            </Button>
          </div>
        </div>
        
        {/* Editor Toolbar */}
        <div className="bg-white border border-gray-200 rounded-t-lg p-2 flex flex-wrap items-center gap-1 shadow-sm">
          <div className="border-r border-gray-200 pr-2 mr-1">
            <select 
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded p-1.5 font-medium"
              onChange={(e) => {
                switch (e.target.value) {
                  case 'h1':
                    handleHeadingFormat('heading-one');
                    break;
                  case 'h2':
                    handleHeadingFormat('heading-two');
                    break;
                  case 'h3':
                    handleHeadingFormat('heading-three');
                    break;
                  default:
                    handleBlockFormat('paragraph');
                }
              }}
            >
              <option value="p">Normal Text</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700" 
            title="Bold"
            onClick={() => handleFormat('bold')}
          >
            <i className="ri-bold"></i>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700" 
            title="Italic"
            onClick={() => handleFormat('italic')}
          >
            <i className="ri-italic"></i>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700" 
            title="Underline"
            onClick={() => handleFormat('underline')}
          >
            <i className="ri-underline"></i>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700" 
            title="Strikethrough"
            onClick={() => toast({
              title: "Strikethrough",
              description: "This formatting will be available soon.",
            })}
          >
            <i className="ri-strikethrough"></i>
          </Button>
          <span className="border-r border-gray-200 h-6 mx-1"></span>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700" 
            title="Bullet List"
            onClick={() => handleBlockFormat('bulleted-list')}
          >
            <i className="ri-list-unordered"></i>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700" 
            title="Numbered List"
            onClick={() => handleBlockFormat('numbered-list')}
          >
            <i className="ri-list-ordered"></i>
          </Button>
          <span className="border-r border-gray-200 h-6 mx-1"></span>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700" 
            title="Link"
            onClick={() => toast({
              title: "Insert Link",
              description: "Link insertion will be available soon.",
            })}
          >
            <i className="ri-link"></i>
          </Button>
          
          {/* View toggle at the right */}
          <div className="ml-auto bg-gray-100 rounded-md p-0.5 flex">
            <Button 
              variant={viewMode === "split" ? "default" : "ghost"}
              size="sm"
              className={`px-3 py-1 text-xs font-medium rounded ${viewMode === "split" ? "bg-white shadow text-gray-800" : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setViewMode("split")}
            >
              Split View
            </Button>
            <Button 
              variant={viewMode === "original" ? "default" : "ghost"}
              size="sm"
              className={`px-3 py-1 text-xs font-medium ${viewMode === "original" ? "bg-white shadow text-gray-800" : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setViewMode("original")}
            >
              Original
            </Button>
            <Button 
              variant={viewMode === "clean" ? "default" : "ghost"}
              size="sm"
              className={`px-3 py-1 text-xs font-medium ${viewMode === "clean" ? "bg-white shadow text-gray-800" : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setViewMode("clean")}
            >
              Clean
            </Button>
          </div>
        </div>
        
        {/* Editor Content */}
        <div className={`grid ${viewMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-0 border-l border-r border-gray-200 bg-white`}>
          {/* Original Text */}
          {(viewMode === "split" || viewMode === "original") && (
            <div className={`${viewMode === "split" ? "border-r border-gray-200" : ""} p-4 editor-content min-h-[200px]`}>
              <Slate
                editor={originalEditor}
                initialValue={originalValue}
                onChange={handleOriginalValueChange}
              >
                <Editable
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  placeholder="Enter or paste AI-generated text here..."
                  className="min-h-[200px] focus:outline-none"
                  spellCheck
                />
              </Slate>
            </div>
          )}
          
          {/* Clean Text */}
          {(viewMode === "split" || viewMode === "clean") && (
            <div className={`${viewMode === "split" ? "bg-gray-50" : ""} p-4 editor-content min-h-[200px]`}>
              <Slate
                editor={cleanedEditor}
                initialValue={cleanedValue}
                onChange={value => setCleanedValue(value)}
              >
                <Editable
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  placeholder="Cleaned text will appear here..."
                  className="min-h-[200px] focus:outline-none"
                  readOnly
                />
              </Slate>
            </div>
          )}
        </div>
        
        {/* Bottom info panel */}
        <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-4 shadow-sm">
          <DetectorGauge />
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-500">Word count: </span>
              <span className="font-medium">{wordCount.toLocaleString()}</span>
              <span className="text-gray-500 ml-4">Character count: </span>
              <span className="font-medium">{charCount.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <ClipboardBridge value={cleanedValue} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}