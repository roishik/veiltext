import { TransformationRule, RulePreset } from "@/types";

// Default rules based on the product specification
const defaultRules: TransformationRule[] = [
  {
    id: "rule-1",
    name: "Replace Dashes",
    description: "Replace all dash variants with standard hyphen",
    type: "replace",
    pattern: "U+2012–U+2015, U+2212",
    replacement: "-",
    enabled: true
  },
  {
    id: "rule-2",
    name: "Smart Single Quotes",
    description: "Replace smart single quotes with standard apostrophe",
    type: "replace",
    pattern: "U+2018, U+2019, U+201A, U+201B, U+2032–U+2035",
    replacement: "'",
    enabled: true
  },
  {
    id: "rule-3",
    name: "Smart Double Quotes",
    description: "Replace smart double quotes with standard quotation marks",
    type: "replace",
    pattern: "U+201C–U+201F, U+2033, U+2036, U+00AB, U+00BB",
    replacement: "\"",
    enabled: true
  },
  {
    id: "rule-4",
    name: "Ellipsis",
    description: "Replace ellipsis character with periods",
    type: "replace",
    pattern: "U+2026",
    replacement: "...",
    enabled: true
  },
  {
    id: "rule-5",
    name: "Bullets",
    description: "Replace bullet and mid-dot characters with asterisk",
    type: "replace",
    pattern: "U+2022, U+00B7",
    replacement: "*",
    enabled: true
  },
  {
    id: "rule-6",
    name: "Remove Invisibles",
    description: "Remove invisible Unicode characters",
    type: "remove",
    pattern: "U+00AD, U+180E, U+200B–U+200F, U+202A–U+202E, U+2060–U+206F, U+FE00–U+FE0F, U+FEFF",
    replacement: "",
    enabled: true
  },
  {
    id: "rule-7",
    name: "Unicode Spaces",
    description: "Normalize all space variants to ASCII space",
    type: "replace",
    pattern: "U+00A0, U+1680, U+2000–U+200A, U+202F, U+205F, U+3000",
    replacement: " ",
    enabled: false
  },
  {
    id: "rule-8",
    name: "Full-width ASCII",
    description: "Convert full-width ASCII characters to half-width",
    type: "replace",
    pattern: "/[\\uFF01-\\uFF5E]/g",
    replacement: "m => String.fromCharCode(m.charCodeAt(0) - 0xFEE0)",
    enabled: true
  }
];

// Default presets
const defaultPresets: RulePreset[] = [
  {
    id: "preset-default",
    name: "Default Preset",
    ruleIds: defaultRules.filter(rule => rule.enabled).map(rule => rule.id),
    isDefault: true
  },
  {
    id: "preset-academic",
    name: "Academic Publishing",
    ruleIds: ["rule-1", "rule-2", "rule-3", "rule-4", "rule-6"],
    isDefault: false
  },
  {
    id: "preset-technical",
    name: "Technical Writing",
    ruleIds: ["rule-1", "rule-2", "rule-3", "rule-4", "rule-5", "rule-6", "rule-7", "rule-8"],
    isDefault: false
  },
  {
    id: "preset-creative",
    name: "Creative Fiction",
    ruleIds: ["rule-1", "rule-3", "rule-6"],
    isDefault: false
  }
];

// In-memory storage for rules and presets
let rules: TransformationRule[] = [...defaultRules];
let presets: RulePreset[] = [...defaultPresets];

// Simulate IndexedDB persistence
const persistToLocalStorage = () => {
  try {
    localStorage.setItem('veiltext-rules', JSON.stringify(rules));
    localStorage.setItem('veiltext-presets', JSON.stringify(presets));
  } catch (error) {
    console.error('Failed to persist data to localStorage:', error);
  }
};

// Load data from localStorage
const loadFromLocalStorage = () => {
  try {
    const savedRules = localStorage.getItem('veiltext-rules');
    const savedPresets = localStorage.getItem('veiltext-presets');
    
    if (savedRules) {
      rules = JSON.parse(savedRules);
    }
    
    if (savedPresets) {
      presets = JSON.parse(savedPresets);
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }
};

// Initialize storage
const initStorage = () => {
  loadFromLocalStorage();
  
  // If no data was loaded, use defaults
  if (rules.length === 0) {
    rules = [...defaultRules];
  }
  
  if (presets.length === 0) {
    presets = [...defaultPresets];
  }
};

// Call init when the module is imported
initStorage();

// Utility functions
export const getAllRules = (): TransformationRule[] => [...rules];

export const getRuleById = (id: string): TransformationRule | undefined => {
  return rules.find(rule => rule.id === id);
};

export const addRule = (rule: TransformationRule): void => {
  rules.push(rule);
  persistToLocalStorage();
};

export const updateRule = (updatedRule: TransformationRule): void => {
  const index = rules.findIndex(rule => rule.id === updatedRule.id);
  if (index !== -1) {
    rules[index] = updatedRule;
    persistToLocalStorage();
  }
};

export const deleteRule = (id: string): void => {
  rules = rules.filter(rule => rule.id !== id);
  
  // Also remove from presets
  presets.forEach(preset => {
    preset.ruleIds = preset.ruleIds.filter(ruleId => ruleId !== id);
  });
  
  persistToLocalStorage();
};

export const getAllPresets = (): RulePreset[] => [...presets];

export const getPresetById = (id: string): RulePreset | undefined => {
  return presets.find(preset => preset.id === id);
};

export const getDefaultPreset = (): RulePreset => {
  const defaultPreset = presets.find(preset => preset.isDefault);
  if (defaultPreset) {
    return defaultPreset;
  }
  return presets[0];
};

export const savePreset = (name: string, ruleIds: string[]): RulePreset => {
  const newPreset: RulePreset = {
    id: `preset-${Date.now()}`,
    name,
    ruleIds,
    isDefault: false
  };
  
  presets.push(newPreset);
  persistToLocalStorage();
  
  return newPreset;
};

export const updatePreset = (updatedPreset: RulePreset): void => {
  const index = presets.findIndex(preset => preset.id === updatedPreset.id);
  if (index !== -1) {
    presets[index] = updatedPreset;
    persistToLocalStorage();
  }
};

export const deletePreset = (id: string): void => {
  presets = presets.filter(preset => preset.id !== id);
  persistToLocalStorage();
};

export const setDefaultPreset = (id: string): void => {
  presets.forEach(preset => {
    preset.isDefault = preset.id === id;
  });
  persistToLocalStorage();
};
