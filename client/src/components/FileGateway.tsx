import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Descendant, Element, Text } from "slate";
import * as mammoth from "mammoth/mammoth.browser";

// Sample import mapping from DOCX to Slate structure
const convertMammothResultToSlate = (result: { value: string }): Descendant[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(result.value, "text/html");
  
  const convertNode = (node: Node): Descendant | Descendant[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      return { text: node.textContent || "" };
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return { text: "" };
    }
    
    const el = node as HTMLElement;
    const children: Descendant[] = [];
    
    for (const childNode of Array.from(el.childNodes)) {
      const result = convertNode(childNode);
      if (Array.isArray(result)) {
        children.push(...result);
      } else {
        children.push(result);
      }
    }
    
    // If there are no children, add an empty text node
    if (children.length === 0) {
      children.push({ text: "" });
    }
    
    // Convert HTML elements to Slate elements
    switch (el.tagName.toLowerCase()) {
      case "h1":
        return { type: "heading-one", children };
      case "h2":
        return { type: "heading-two", children };
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        return { type: "heading-three", children };
      case "p":
        return { type: "paragraph", children };
      case "ul":
        return { type: "bulleted-list", children };
      case "ol":
        return { type: "numbered-list", children };
      case "li":
        return { type: "list-item", children };
      case "a":
        return { 
          type: "link", 
          url: el.getAttribute("href") || "#", 
          children 
        };
      case "strong":
      case "b":
        return children.map(child => {
          if (Text.isText(child)) {
            return { ...child, bold: true };
          }
          return child;
        });
      case "em":
      case "i":
        return children.map(child => {
          if (Text.isText(child)) {
            return { ...child, italic: true };
          }
          return child;
        });
      case "u":
        return children.map(child => {
          if (Text.isText(child)) {
            return { ...child, underline: true };
          }
          return child;
        });
      case "code":
        return children.map(child => {
          if (Text.isText(child)) {
            return { ...child, code: true };
          }
          return child;
        });
      case "div":
      case "span":
      case "body":
        // If it's just a container, return its children
        return children;
      default:
        // For any other element, create a paragraph
        return { type: "paragraph", children };
    }
  };
  
  const slateNodes: Descendant[] = [];
  
  for (const childNode of Array.from(doc.body.childNodes)) {
    const result = convertNode(childNode);
    if (Array.isArray(result)) {
      slateNodes.push(...result);
    } else {
      slateNodes.push(result);
    }
  }
  
  // If no content was found, return a default paragraph
  if (slateNodes.length === 0) {
    return [{ type: "paragraph", children: [{ text: "" }] }];
  }
  
  return slateNodes;
};

interface FileGatewayProps {
  onImport: (value: Descendant[]) => void;
}

export default function FileGateway({ onImport }: FileGatewayProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Handle different file formats
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const slateValue = convertMammothResultToSlate(result);
        onImport(slateValue);
      } else if (file.name.endsWith('.txt')) {
        const text = await file.text();
        const paragraphs = text.split(/\r?\n\r?\n/);
        
        const slateValue = paragraphs.map(paragraph => ({
          type: 'paragraph',
          children: [{ text: paragraph }]
        }));
        
        onImport(slateValue);
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        const text = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        // TODO: Implement proper HTML to Slate conversion
        const bodyText = doc.body.textContent || '';
        const paragraphs = bodyText.split(/\r?\n\r?\n/).filter(p => p.trim());
        
        const slateValue = paragraphs.map(paragraph => ({
          type: 'paragraph',
          children: [{ text: paragraph }]
        }));
        
        onImport(slateValue);
      } else {
        toast({
          title: "Unsupported File Format",
          description: "Please upload a .docx, .txt, or .html file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to process the uploaded file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };
  
  const handleDownload = () => {
    setIsDownloading(true);
    
    try {
      toast({
        title: "Download Feature",
        description: "File download will be available in the next update.",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate the download file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline"
        className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
        onClick={() => document.getElementById('file-upload')?.click()}
        disabled={isUploading}
      >
        <i className={`ri-upload-line mr-1.5 ${isUploading ? 'animate-spin' : ''}`}></i>
        {isUploading ? "Uploading..." : "Upload File"}
      </Button>
      <input
        id="file-upload"
        type="file"
        accept=".docx,.txt,.html,.htm"
        className="hidden"
        onChange={handleFileUpload}
      />
      
      <Button 
        variant="outline"
        className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        <i className={`ri-file-download-line mr-1.5 ${isDownloading ? 'animate-spin' : ''}`}></i>
        {isDownloading ? "Downloading..." : "Download"}
      </Button>
    </>
  );
}
