// Rule types for transformation
export type RuleType = "replace" | "remove";

export interface TransformationRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  pattern: string;
  replacement: string;
  enabled: boolean;
}

export interface RulePreset {
  id: string;
  name: string;
  ruleIds: string[];
  isDefault: boolean;
}

// Detection service types
export interface DetectionResult {
  humanLikenessScore: number;
  source: string;
  rawScore: number;
  confidence: number;
}

export interface DetectionResponse {
  aggregateScore: number;
  results: DetectionResult[];
  timestamp: number;
}

// File types
export interface FileImportResult {
  content: string;
  format: string;
  metadata?: Record<string, any>;
}

export interface FileExportOptions {
  fileName: string;
  format: "docx" | "html" | "txt" | "md";
  includeMetadata?: boolean;
}
