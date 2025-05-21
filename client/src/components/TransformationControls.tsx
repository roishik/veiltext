import { useTextContext } from '@/contexts/TextContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export default function TransformationControls() {
  const {
    transformations,
    activeTransformationIds,
    toggleTransformation,
    enableAllTransformations,
    disableAllTransformations
  } = useTextContext();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Transformations</CardTitle>
            <CardDescription>
              Control how your text is transformed
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={enableAllTransformations}
              className="h-8"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={disableAllTransformations}
              className="h-8"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              None
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transformations.map((transformation) => (
            <div 
              key={transformation.id} 
              className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
            >
              <div>
                <Label 
                  htmlFor={`transform-${transformation.id}`}
                  className="font-medium cursor-pointer"
                >
                  {transformation.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {transformation.pattern} → {transformation.replacement}
                </p>
              </div>
              <Switch
                id={`transform-${transformation.id}`}
                checked={activeTransformationIds.includes(transformation.id)}
                onCheckedChange={() => toggleTransformation(transformation.id)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}