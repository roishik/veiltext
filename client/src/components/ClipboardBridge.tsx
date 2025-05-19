import { useState } from "react";
import { Descendant, Node } from "slate";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ClipboardBridgeProps {
  value: Descendant[];
}

export default function ClipboardBridge({ value }: ClipboardBridgeProps) {
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);

  // Function to convert Slate value to plain text
  const serializeToText = (nodes: Descendant[]) => {
    return nodes.map((n) => Node.string(n)).join('\n');
  };

  // Function to convert Slate value to HTML
  const serializeToHtml = (nodes: Descendant[]) => {
    return nodes.map((node) => {
      if (!Node.isNode(node)) return '';
      
      if (Node.isText(node)) {
        let text = node.text;
        
        if (node.bold) {
          text = `<strong>${text}</strong>`;
        }
        
        if (node.italic) {
          text = `<em>${text}</em>`;
        }
        
        if (node.underline) {
          text = `<u>${text}</u>`;
        }
        
        if (node.code) {
          text = `<code>${text}</code>`;
        }
        
        return text;
      }
      
      const children = node.children.map((child) => {
        if (Node.isText(child)) {
          let text = child.text;
          
          if (child.bold) {
            text = `<strong>${text}</strong>`;
          }
          
          if (child.italic) {
            text = `<em>${text}</em>`;
          }
          
          if (child.underline) {
            text = `<u>${text}</u>`;
          }
          
          if (child.code) {
            text = `<code>${text}</code>`;
          }
          
          return text;
        }
        
        return '';
      }).join('');
      
      switch (node.type) {
        case 'heading-one':
          return `<h1>${children}</h1>`;
        case 'heading-two':
          return `<h2>${children}</h2>`;
        case 'heading-three':
          return `<h3>${children}</h3>`;
        case 'paragraph':
          return `<p>${children}</p>`;
        case 'bulleted-list':
          return `<ul>${children}</ul>`;
        case 'numbered-list':
          return `<ol>${children}</ol>`;
        case 'list-item':
          return `<li>${children}</li>`;
        case 'link':
          return `<a href="${node.url}">${children}</a>`;
        default:
          return children;
      }
    }).join('');
  };

  const handleCopy = async () => {
    try {
      setCopying(true);
      
      // Get both plain text and HTML representations
      const plainText = serializeToText(value);
      const htmlText = serializeToHtml(value);
      
      // For modern browsers supporting navigator.clipboard with HTML
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
          'text/html': new Blob([htmlText], { type: 'text/html' })
        });
        
        await navigator.clipboard.write([item]);
      } 
      // Fallback for browsers not supporting ClipboardItem
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(plainText);
      }
      // Last resort fallback using document.execCommand
      else {
        const textArea = document.createElement('textarea');
        textArea.value = plainText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      toast({
        title: "Copied to Clipboard",
        description: "The cleaned text has been copied with formatting preserved.",
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy text to clipboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  return (
    <Button 
      className="bg-primary-600 hover:bg-primary-700 text-white transition-all"
      onClick={handleCopy}
      disabled={copying}
    >
      <i className={`ri-clipboard-line mr-1.5 ${copying ? 'animate-pulse' : ''}`}></i>
      {copying ? "Copying..." : "Copy Clean Text"}
    </Button>
  );
}
