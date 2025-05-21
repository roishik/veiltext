export interface TextTransformation {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  enabled: boolean;
}

export interface TextStats {
  words: number;
  characters: number;
  humanLikenessScore: number;
}