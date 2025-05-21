import { TextProvider } from '@/contexts/TextContext';
import TextEditor from '@/components/TextEditor';
import TransformationControls from '@/components/TransformationControls';
import { Card, CardContent } from '@/components/ui/card';
import { MoveRight, Shield } from 'lucide-react';

export default function Home() {
  return (
    <TextProvider>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              VeilText
            </h1>
            <p className="text-xl mt-2 max-w-2xl text-muted-foreground">
              Transform AI-generated content to appear more natural
            </p>
          </div>
        </header>

        {/* Main content */}
        <div className="grid gap-8 md:grid-cols-4">
          {/* Main editor area - takes 3/4 width on desktop */}
          <div className="md:col-span-3 space-y-6">
            <TextEditor />
            
            {/* Privacy disclaimer */}
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>Privacy-first:</strong> Your text never leaves your device. All transformations are processed locally in your browser.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - takes 1/4 width on desktop */}
          <div className="space-y-6">
            <TransformationControls />

            {/* How it works */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">How It Works</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="bg-muted rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">1</div>
                    <p>Paste your AI-generated text in the editor</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-muted rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">2</div>
                    <p>Customize the transformations to apply</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-muted rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">3</div>
                    <p>Copy or download your transformed text</p>
                  </div>
                  <div className="pt-2 flex items-center text-muted-foreground">
                    <MoveRight className="h-3.5 w-3.5 mr-1" />
                    <span>Instant transformation with no delay</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TextProvider>
  );
}