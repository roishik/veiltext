// Simple, deterministic functions for text transformation and detection

/**
 * Transforms text to make it more human-like by replacing common AI patterns
 * Carefully preserves line breaks and formatting
 */
export function transformText(text: string): string {
  if (!text) return '';
  
  // Common replacements for AI-generated text patterns
  const replacements = [
    { from: '—', to: '-' },     // em dash
    { from: '–', to: '-' },     // en dash
    { from: '…', to: '...' },   // ellipsis
    { from: '"', to: '"' },     // left double quote
    { from: '"', to: '"' },     // right double quote
    { from: "'", to: "'" },     // left single quote
    { from: "'", to: "'" },     // right single quote
    { from: '•', to: '*' }      // bullet
  ];
  
  // Process text while preserving line breaks
  // Split by line breaks, transform each line, then rejoin
  const lines = text.split(/\r?\n/);
  const transformedLines = lines.map(line => {
    let result = line;
    for (const { from, to } of replacements) {
      // Safely escape special regex characters in the 'from' string
      const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escapedFrom, 'g'), to);
    }
    return result;
  });
  
  // Rejoin with the original line breaks
  return transformedLines.join('\n');
}

/**
 * Calculates a deterministic "human-likeness" score for text
 * Higher score = more human-like (range: 0-100)
 */
export function calculateHumanLikenessScore(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  
  // Text analysis metrics
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = wordCount / Math.max(1, sentenceCount);
  const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
  const lexicalDiversity = uniqueWords / Math.max(1, wordCount);
  
  // Character type analysis
  const specialChars = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const specialCharRatio = specialChars / Math.max(1, text.length);
  
  // Calculate score components (all are deterministic)
  const lengthFactor = Math.min(1, wordCount / 300) * 30;  // Rewards proper length
  const diversityFactor = lexicalDiversity * 40;           // Rewards vocabulary variety
  const sentenceFactor = Math.min(15, avgWordsPerSentence) * 2; // Rewards natural sentence length
  const specialCharFactor = specialCharRatio * 15;         // Penalizes excessive special chars (common in AI text)
  
  // Base score that rewards human-like patterns
  let score = 40 + lengthFactor + diversityFactor + sentenceFactor - specialCharFactor;
  
  // Cap within range and apply minimum threshold for very short text
  score = Math.min(95, Math.max(30, score));
  if (wordCount < 50) {
    score = Math.max(40, score * 0.8);
  }
  
  return Math.round(score);
}

/**
 * Calculates word and character counts for text
 */
export function countTextStats(text: string): { words: number, characters: number } {
  if (!text) return { words: 0, characters: 0 };
  
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  
  return { words, characters };
}