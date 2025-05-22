import React, { useState, useEffect, useRef } from 'react';
import { useTextContext } from '@/contexts/TextContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClipboardCopy, ArrowDown, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Simple HumanLikeness gauge component
 */
function HumanLikenessGauge({ score }: { score: number }) {
  // Color scheme based on score ranges
  const getColor = () => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-green-400';
    if (score >= 60) return 'bg-yellow-400';
    if (score >= 40) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Human Likeness</span>
        <Badge variant="outline" className="ml-2">{score}%</Badge>
      </div>
      <Progress
        value={score}
        max={100}
        className="h-2"
        indicatorClassName={getColor()}
      />
    </div>
  );
}

/**
 * Main TextEditor component
 */
export default function TextEditor() {
  const {
    originalText,
    cleanedText,
    stats,
    setOriginalText
  } = useTextContext();

  // Editor references
  const editorRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  
  // Local state for copied status
  const [copied, setCopied] = useState(false);

  // Set initial content when component mounts
  useEffect(() => {
    if (editorRef.current && originalText) {
      editorRef.current.innerHTML = originalText;
    }
  }, []);
  
  // Handle paste event to capture formatted content
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    let content = '';
    
    // Try to get HTML content first to preserve formatting
    const htmlContent = clipboardData.getData('text/html');
    if (htmlContent) {
      content = htmlContent;
    } else {
      // Fallback to plain text and convert newlines to <br>
      const textContent = clipboardData.getData('text/plain');
      content = textContent.replace(/\n/g, '<br>');
    }
    
    // Insert at cursor position
    document.execCommand('insertHTML', false, content);
    
    // Capture the updated content
    if (editorRef.current) {
      setOriginalText(editorRef.current.innerHTML);
    }
  };
  
  // Handle input to capture changes
  const handleInput = () => {
    if (editorRef.current) {
      setOriginalText(editorRef.current.innerHTML);
    }
  };

  // Reset copied status after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  // Handle text copy with formatting
  const handleCopy = async () => {
    if (cleanedText && outputRef.current) {
      try {
        // Try to use the modern clipboard API with HTML support
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([outputRef.current.innerHTML], { type: 'text/html' }),
          'text/plain': new Blob([cleanedText], { type: 'text/plain' })
        });
        
        await navigator.clipboard.write([clipboardItem]);
        setCopied(true);
      } catch (err) {
        // Fallback for browsers that don't support ClipboardItem
        await navigator.clipboard.writeText(cleanedText);
        setCopied(true);
      }
    }
  };

  // Handle text download with formatting
  const handleDownload = () => {
    if (!cleanedText) return;
    
    // Create HTML file with formatting preserved
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>VeilText Transformed Content</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.5; padding: 20px; }
  </style>
</head>
<body>
  ${outputRef.current?.innerHTML || cleanedText}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'veiltext-transformed.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 w-full">
      {/* Original Text Input */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Original Text</h2>
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[300px] w-full rounded-md bg-background focus:outline-none overflow-auto p-2"
              onPaste={handlePaste}
              onInput={handleInput}
              style={{ 
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            />
          </CardContent>
        </Card>
        <div className="text-sm text-muted-foreground">
          {stats.words > 0 ? `${stats.words} words, ${stats.characters} characters` : 'No text entered'}
        </div>
      </div>

      {/* Transformed Text Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Transformed Text</h2>
          
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopy}
                    disabled={!cleanedText}
                  >
                    <ClipboardCopy className="h-4 w-4 mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy transformed text to clipboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownload}
                    disabled={!cleanedText}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download as HTML file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div 
              ref={outputRef}
              className="min-h-[300px] rounded-md bg-muted/40 p-2 overflow-auto whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: cleanedText }}
              style={{ 
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col space-y-2">
          <HumanLikenessGauge score={stats.humanLikenessScore} />
          
          {stats.humanLikenessScore > 0 && (
            <div className="text-sm text-muted-foreground flex items-center">
              <ArrowDown className="h-3 w-3 mr-1" />
              Higher score means less likely to be detected as AI-generated
            </div>
          )}
        </div>
      </div>
    </div>
  );
}