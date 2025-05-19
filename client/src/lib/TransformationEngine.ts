import { Descendant, Node, Text } from "slate";
import { getRuleById } from "./PresetStore";

// Process a text node with the given transformation rules
const transformTextNode = (node: any, ruleIds: string[]): any => {
  if (!Text.isText(node)) {
    return node;
  }
  
  let text = node.text;
  
  // Skip empty text nodes
  if (!text) {
    return node;
  }
  
  // Apply each rule in order
  ruleIds.forEach(ruleId => {
    const rule = getRuleById(ruleId);
    
    if (!rule || !rule.enabled) {
      return;
    }
    
    if (rule.type === "replace") {
      try {
        // Handle different pattern formats
        if (rule.pattern.startsWith("U+")) {
          // Unicode code point replacement
          const unicodePattern = parseUnicodePattern(rule.pattern);
          text = text.replace(unicodePattern, rule.replacement);
        } else if (rule.pattern.startsWith("/") && rule.pattern.includes("/")) {
          // Regex pattern
          const regexPattern = parseRegexPattern(rule.pattern);
          if (regexPattern) {
            text = text.replace(regexPattern, rule.replacement);
          }
        } else {
          // Plain string replacement
          text = text.replace(new RegExp(escapeRegExp(rule.pattern), "g"), rule.replacement);
        }
      } catch (error) {
        console.error(`Error applying rule ${rule.id}:`, error);
      }
    } else if (rule.type === "remove") {
      try {
        // Handle different pattern formats
        if (rule.pattern.startsWith("U+")) {
          // Unicode code point removal
          const unicodePattern = parseUnicodePattern(rule.pattern);
          text = text.replace(unicodePattern, "");
        } else if (rule.pattern.startsWith("/") && rule.pattern.includes("/")) {
          // Regex pattern
          const regexPattern = parseRegexPattern(rule.pattern);
          if (regexPattern) {
            text = text.replace(regexPattern, "");
          }
        } else {
          // Plain string removal
          text = text.replace(new RegExp(escapeRegExp(rule.pattern), "g"), "");
        }
      } catch (error) {
        console.error(`Error applying rule ${rule.id}:`, error);
      }
    }
  });
  
  // Return a new node with the transformed text
  return { ...node, text };
};

// Helper function to parse Unicode pattern notation (U+XXXX or U+XXXX–U+YYYY)
const parseUnicodePattern = (pattern: string): RegExp => {
  // Handle ranges like U+2012–U+2015
  if (pattern.includes("–") || pattern.includes("-")) {
    const separator = pattern.includes("–") ? "–" : "-";
    const [start, end] = pattern.split(separator).map(part => {
      const codePointStr = part.trim().replace("U+", "");
      return parseInt(codePointStr, 16);
    });
    
    return new RegExp(`[\\u${start.toString(16)}-\\u${end.toString(16)}]`, "g");
  }
  
  // Handle single code points or comma-separated list
  const codePoints = pattern.split(",").map(part => {
    const codePointStr = part.trim().replace("U+", "");
    return parseInt(codePointStr, 16);
  });
  
  if (codePoints.length === 1) {
    return new RegExp(String.fromCodePoint(codePoints[0]), "g");
  }
  
  // Create a character class for multiple code points
  const charClass = codePoints.map(cp => `\\u${cp.toString(16).padStart(4, '0')}`).join("");
  return new RegExp(`[${charClass}]`, "g");
};

// Helper function to parse regex pattern notation (/pattern/flags)
const parseRegexPattern = (pattern: string): RegExp | null => {
  try {
    const match = pattern.match(/^\/(.+)\/([gimuy]*)$/);
    if (match) {
      const [, regex, flags] = match;
      return new RegExp(regex, flags);
    }
    return null;
  } catch (error) {
    console.error("Invalid regex pattern:", pattern, error);
    return null;
  }
};

// Helper function to escape special regex characters in a string
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Process a Slate node and all its descendants
const transformNode = (node: Descendant, ruleIds: string[]): Descendant => {
  if (Text.isText(node)) {
    return transformTextNode(node, ruleIds);
  }
  
  // For non-text nodes, recursively transform their children
  const children = node.children.map(child => transformNode(child as Descendant, ruleIds));
  
  return {
    ...node,
    children
  };
};

// Main transformation function that processes the entire Slate document
export const applyTransformations = (nodes: Descendant[], ruleIds: string[]): Descendant[] => {
  if (!nodes || nodes.length === 0 || !ruleIds || ruleIds.length === 0) {
    return nodes;
  }
  
  return nodes.map(node => transformNode(node, ruleIds));
};

// Extract plain text from Slate nodes
export const getPlainText = (nodes: Descendant[]): string => {
  return nodes.map(node => Node.string(node)).join('\n');
};
