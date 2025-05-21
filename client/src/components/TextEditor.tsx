import { useState, useEffect } from 'react';
import { useTextContext } from '@/contexts/TextContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

  // Local state for copied status
  const [copied, setCopied] = useState(false);

  // Reset copied status after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  // Handle text copy
  const handleCopy = async () => {
    if (cleanedText) {
      await navigator.clipboard.writeText(cleanedText);
      setCopied(true);
    }
  };

  // Handle text download
  const handleDownload = () => {
    if (!cleanedText) return;
    
    const blob = new Blob([cleanedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'veiltext-transformed.txt';
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
            <Textarea 
              placeholder="Paste your AI-generated content here..."
              className="min-h-[300px] rounded-md border-0 resize-none focus-visible:ring-0" 
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
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
            <div className="min-h-[300px] rounded-md bg-muted/40 p-4 whitespace-pre-wrap">
              {cleanedText || (
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