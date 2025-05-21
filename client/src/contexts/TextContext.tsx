import React, { createContext, useContext, useState, useCallback } from 'react';
import { transformText, calculateHumanLikenessScore, countTextStats } from '@/lib/textUtils';
import { TextTransformation, TextStats } from '@/lib/types';

// Default transformations that will be applied
const defaultTransformations: TextTransformation[] = [
  {
    id: 'special-chars',
    name: 'Special Characters',
    pattern: '[""]',
    replacement: '"',
    enabled: true
  },
  {
    id: 'em-dashes',
    name: 'Em Dashes',
    pattern: '—',
    replacement: '-',
    enabled: true
  },
  {
    id: 'smart-quotes',
    name: 'Smart Quotes',
    pattern: "'",
    replacement: "'",
    enabled: true
  },
  {
    id: 'ellipsis',
    name: 'Ellipsis',
    pattern: '…',
    replacement: '...',
    enabled: true
  }
];

interface TextContextType {
  // Text content
  originalText: string;
  cleanedText: string;
  
  // Stats
  stats: TextStats;
  
  // Transformations
  transformations: TextTransformation[];
  activeTransformationIds: string[];
  
  // Actions
  setOriginalText: (text: string) => void;
  toggleTransformation: (id: string) => void;
  enableAllTransformations: () => void;
  disableAllTransformations: () => void;
}

const TextContext = createContext<TextContextType | undefined>(undefined);

export function TextProvider({ children }: { children: React.ReactNode }) {
  // Core state
  const [originalText, setOriginalTextState] = useState('');
  const [cleanedText, setCleanedText] = useState('');
  const [transformations] = useState<TextTransformation[]>(defaultTransformations);
  const [activeTransformationIds, setActiveTransformationIds] = useState<string[]>(
    defaultTransformations.filter(t => t.enabled).map(t => t.id)
  );
  const [stats, setStats] = useState<TextStats>({ words: 0, characters: 0, humanLikenessScore: 0 });

  // Transform text whenever original text or active transformations change
  const updateCleanedText = useCallback((text: string, activeIds: string[]) => {
    // Apply all transformations to get cleaned text
    let result = text;
    
    if (text.trim()) {
      // Only apply transformations if there is text
      result = transformText(text);
      
      // Calculate stats
      const { words, characters } = countTextStats(result);
      const humanLikenessScore = calculateHumanLikenessScore(result);
      
      setStats({ words, characters, humanLikenessScore });
    } else {
      // Reset stats when no text
      setStats({ words: 0, characters: 0, humanLikenessScore: 0 });
    }
    
    setCleanedText(result);
  }, []);

  // Set original text and transform it
  const setOriginalText = useCallback((text: string) => {
    setOriginalTextState(text);
    updateCleanedText(text, activeTransformationIds);
  }, [activeTransformationIds, updateCleanedText]);

  // Toggle a transformation on/off
  const toggleTransformation = useCallback((id: string) => {
    setActiveTransformationIds(prevIds => {
      const newIds = prevIds.includes(id) 
        ? prevIds.filter(i => i !== id)
        : [...prevIds, id];
      
      // Re-apply transformations with new active set
      updateCleanedText(originalText, newIds);
      return newIds;
    });
  }, [originalText, updateCleanedText]);

  // Enable all transformations
  const enableAllTransformations = useCallback(() => {
    const allIds = transformations.map(t => t.id);
    setActiveTransformationIds(allIds);
    updateCleanedText(originalText, allIds);
  }, [originalText, transformations, updateCleanedText]);

  // Disable all transformations
  const disableAllTransformations = useCallback(() => {
    setActiveTransformationIds([]);
    updateCleanedText(originalText, []);
  }, [originalText, updateCleanedText]);

  const contextValue = {
    originalText,
    cleanedText,
    stats,
    transformations,
    activeTransformationIds,
    setOriginalText,
    toggleTransformation,
    enableAllTransformations,
    disableAllTransformations
  };

  return (
    <TextContext.Provider value={contextValue}>
      {children}
    </TextContext.Provider>
  );
}

export function useTextContext() {
  const context = useContext(TextContext);
  if (context === undefined) {
    throw new Error('useTextContext must be used within a TextProvider');
  }
  return context;
}