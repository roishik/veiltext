import { useState, useEffect } from "react";
import { useEditorContext } from "@/contexts/EditorContext";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function DetectorGauge() {
  const { originalContent, cleanedContent } = useEditorContext();
  const [humanLikenessScore, setHumanLikenessScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Deterministic detection score calculation
  const calculateDetectionScore = async (text: string) => {
    if (!text || text.trim() === "") return 0;
    
    setIsLoading(true);
    
    try {
      // Use a deterministic approach to calculate the score
      const wordCount = text.split(/\s+/).length;
      const sentenceCount = text.split(/[.!?]+/).length;
      const avgWordPerSentence = wordCount / Math.max(1, sentenceCount);
      
      // Calculate complexity score based on text statistics - fully deterministic
      const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
      const lexicalDiversity = uniqueWords / Math.max(1, wordCount);
      
      // Character type ratios
      const specialChars = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
      const specialCharRatio = specialChars / Math.max(1, text.length);
      
      // Calculate baseline score using a deterministic formula
      const lengthFactor = Math.min(1, wordCount / 300) * 30;
      const diversityFactor = lexicalDiversity * 40;
      const sentenceStructureFactor = Math.min(15, avgWordPerSentence) * 2;
      const specialCharFactor = specialCharRatio * 15;
      
      // Consistent scoring formula
      let score = 40 + lengthFactor + diversityFactor + sentenceStructureFactor - specialCharFactor;
      
      // Ensure within bounds
      score = Math.min(95, Math.max(30, score));
      
      // If text is very short, reduce score
      if (wordCount < 50) {
        score = Math.max(40, score * 0.8);
      }
      
      // Round to whole number
      score = Math.round(score);
      
      return score;
    } catch (error) {
      console.error("Error calculating detection score:", error);
      toast({
        title: "Detection Error",
        description: "Failed to analyze text. Please try again.",
        variant: "destructive",
      });
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  // Update the detection score when content changes
  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (cleanedContent && cleanedContent.trim() !== "") {
        const score = await calculateDetectionScore(cleanedContent);
        setHumanLikenessScore(score);
        setLastUpdated(new Date());
      } else {
        setHumanLikenessScore(0);
      }
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [cleanedContent]);

  const handleRefresh = async () => {
    if (cleanedContent && cleanedContent.trim() !== "") {
      const score = await calculateDetectionScore(cleanedContent);
      setHumanLikenessScore(score);
      setLastUpdated(new Date());
      toast({
        title: "Detection Updated",
        description: "The AI detection results have been refreshed.",
      });
    }
  };

  // Get color based on score
  const getGaugeColor = () => {
    if (humanLikenessScore >= 70) return "bg-gradient-to-r from-green-500 to-green-400";
    if (humanLikenessScore >= 40) return "bg-gradient-to-r from-amber-500 to-amber-400";
    return "bg-gradient-to-r from-red-500 to-red-400";
  };

  const getScoreLabel = () => {
    if (humanLikenessScore >= 70) return "Human-Like";
    if (humanLikenessScore >= 40) return "Borderline";
    return "AI-Like";
  };

  // Format time since last update
  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return "Never";
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">AI Detection Results</h3>
        <div className="text-xs text-gray-500 flex items-center">
          <span>Updated {getTimeSinceUpdate()}</span>
          <Button 
            variant="ghost" 
            size="sm"
            className="ml-2 text-primary-600 hover:text-primary-700 p-1 h-auto"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <i className={`ri-refresh-line ${isLoading ? 'animate-spin' : ''}`}></i>
          </Button>
        </div>
      </div>
      
      <div className="relative h-7 bg-gray-200 rounded-full overflow-hidden mb-1">
        <motion.div 
          className={`absolute top-0 left-0 h-full ${getGaugeColor()} rounded-full`}
          initial={{ width: "0%" }}
          animate={{ width: `${humanLikenessScore}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-sm font-semibold">
            {humanLikenessScore > 0 ? `${humanLikenessScore}% ${getScoreLabel()}` : "Waiting for content..."}
          </span>
        </div>
        
        {/* Threshold markers */}
        <div className="absolute top-0 left-[40%] h-full border-l border-gray-400 border-dashed"></div>
        <div className="absolute top-0 left-[70%] h-full border-l border-gray-400 border-dashed"></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span>AI-Like</span>
        <span className="text-amber-600">Borderline</span>
        <span className="text-green-600">Human-Like</span>
      </div>
      
      <Alert className="mt-2 text-xs text-white bg-purple-600 border border-purple-700 px-3 py-1">
        <AlertDescription className="flex items-center whitespace-nowrap">
          <i className="ri-information-line inline-block mr-1"></i>
          Disclaimer: No detector is 100% accurate. Results may vary.
        </AlertDescription>
      </Alert>
    </div>
  );
}
