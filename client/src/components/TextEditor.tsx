import React, { useState, useEffect, useRef } from 'react';
import { useTextContext } from '@/contexts/TextContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClipboardCopy, ArrowDown, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Editor } from '@tinymce/tinymce-react';

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
  const editorRef = useRef<any>(null);
  
  // Local state for copied status
  const [copied, setCopied] = useState(false);
  
  // TinyMCE editor configuration
  const tinyConfig = {
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'charmap',
      'anchor', 'searchreplace', 'visualblocks', 'code',
      'insertdatetime', 'table', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    height: 300,
    placeholder: "Paste your AI-generated content here...",
    // Important: allow paste events to preserve formatting
    paste_data_images: true,
    paste_retain_style_properties: 'all',
    paste_word_valid_elements: '*[*]'
  };

  // Handle when editor content changes
  const handleEditorChange = (content: string) => {
    setOriginalText(content);
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
    if (cleanedText) {
      try {
        // Create a temporary div to hold formatted HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanedText;
        
        // Try to copy as rich text if available in modern browsers
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([tempDiv.innerHTML], { type: 'text/html' }),
          'text/plain': new Blob([cleanedText], { type: 'text/plain' })
        });
        
        await navigator.clipboard.write([clipboardItem]);
        setCopied(true);
      } catch (err) {
        // Fallback to plain text for browsers that don't support ClipboardItem
        await navigator.clipboard.writeText(cleanedText);
        setCopied(true);
      }
    }
  };

  // Handle text download with formatting
  const handleDownload = () => {
    if (!cleanedText) return;
    
    // Create HTML file with formatting
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>VeilText Transformed Content</title>
</head>
<body>
  ${cleanedText}
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
          <CardContent className="p-0">
            <Editor
              onInit={(evt, editor) => editorRef.current = editor}
              initialValue={originalText}
              onEditorChange={handleEditorChange}
              init={tinyConfig}
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
                  <p>Download as text file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="p-0">
            <div className="min-h-[300px] rounded-md bg-muted/40 p-4 whitespace-pre-wrap overflow-auto">
              {cleanedText ? (
                cleanedText.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < cleanedText.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))
              ) : (
                <div className="text-muted-foreground italic">
                  Transformed text will appear here
                </div>
              )}
            </div>
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