import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Descendant } from "slate";
import { 
  getAllRules, 
  getAllPresets,
  getDefaultPreset,
  getRuleById,
  getPresetById
} from "@/lib/PresetStore";
import { TransformationRule, RulePreset } from "@/types";
import { getPlainText } from "@/lib/TransformationEngine";

interface EditorContextType {
  rules: TransformationRule[];
  activeRules: string[];
  toggleRule: (id: string) => void;
  presets: RulePreset[];
  currentPreset: string;
  setCurrentPreset: (id: string) => void;
  originalContent: string;
  cleanedContent: string;
  setOriginalContent: (content: string) => void;
  originalValue: Descendant[];
  setOriginalValue: (value: Descendant[]) => void;
  cleanedValue: Descendant[];
  setCleanedValue: (value: Descendant[]) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [rules, setRules] = useState<TransformationRule[]>([]);
  const [activeRules, setActiveRules] = useState<string[]>([]);
  const [presets, setPresets] = useState<RulePreset[]>([]);
  const [currentPreset, setCurrentPreset] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [cleanedContent, setCleanedContent] = useState<string>("");
  const [originalValue, setOriginalValue] = useState<Descendant[]>([
    { type: "paragraph", children: [{ text: "Paste your AI-generated content here or start typing..." }] },
  ]);
  const [cleanedValue, setCleanedValue] = useState<Descendant[]>([
    { type: "paragraph", children: [{ text: "" }] },
  ]);

  // Initialize rules and presets
  useEffect(() => {
    const loadedRules = getAllRules();
    const loadedPresets = getAllPresets();
    const defaultPreset = getDefaultPreset();
    
    setRules(loadedRules);
    setPresets(loadedPresets);
    setCurrentPreset(defaultPreset.id);
    setActiveRules(defaultPreset.ruleIds);
  }, []);

  // Update active rules when preset changes
  useEffect(() => {
    if (currentPreset) {
      const preset = getPresetById(currentPreset);
      if (preset) {
        setActiveRules(preset.ruleIds);
      }
    }
  }, [currentPreset]);

  // Extract plain text content from Slate values
  useEffect(() => {
    setOriginalContent(getPlainText(originalValue));
  }, [originalValue]);

  useEffect(() => {
    setCleanedContent(getPlainText(cleanedValue));
  }, [cleanedValue]);

  // Toggle a rule on or off
  const toggleRule = (id: string) => {
    setActiveRules(prevActiveRules => {
      if (prevActiveRules.includes(id)) {
        return prevActiveRules.filter(ruleId => ruleId !== id);
      } else {
        return [...prevActiveRules, id];
      }
    });
  };

  const contextValue: EditorContextType = {
    rules,
    activeRules,
    toggleRule,
    presets,
    currentPreset,
    setCurrentPreset,
    originalContent,
    cleanedContent,
    setOriginalContent,
    originalValue,
    setOriginalValue,
    cleanedValue,
    setCleanedValue
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
};
