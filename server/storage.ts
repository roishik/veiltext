import { 
  users, type User, type InsertUser,
  rules, type Rule, type InsertRule,
  presets, type Preset, type InsertPreset,
  detectionLogs, type DetectionLog, type InsertDetectionLog
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Rule methods
  getRule(id: number): Promise<Rule | undefined>;
  getRules(): Promise<Rule[]>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: number, rule: InsertRule): Promise<Rule | undefined>;
  deleteRule(id: number): Promise<boolean>;
  
  // Preset methods
  getPreset(id: number): Promise<Preset | undefined>;
  getPresets(): Promise<Preset[]>;
  createPreset(preset: InsertPreset): Promise<Preset>;
  updatePreset(id: number, preset: InsertPreset): Promise<Preset | undefined>;
  deletePreset(id: number): Promise<boolean>;
  
  // Detection log methods
  createDetectionLog(log: InsertDetectionLog): Promise<DetectionLog>;
  getDetectionLogs(userId?: number): Promise<DetectionLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private rules: Map<number, Rule>;
  private presets: Map<number, Preset>;
  private detectionLogs: Map<number, DetectionLog>;
  private userId: number;
  private ruleId: number;
  private presetId: number;
  private logId: number;

  constructor() {
    this.users = new Map();
    this.rules = new Map();
    this.presets = new Map();
    this.detectionLogs = new Map();
    this.userId = 1;
    this.ruleId = 1;
    this.presetId = 1;
    this.logId = 1;
    
    // Add some default rules
    this.setupDefaults();
  }

  private setupDefaults() {
    // Add default rules
    const defaultRules = [
      {
        name: "Replace Dashes",
        description: "Replace all dash variants with standard hyphen",
        type: "replace",
        pattern: "U+2012–U+2015, U+2212",
        replacement: "-",
        enabled: true
      },
      {
        name: "Smart Single Quotes",
        description: "Replace smart single quotes with standard apostrophe",
        type: "replace",
        pattern: "U+2018, U+2019, U+201A, U+201B, U+2032–U+2035",
        replacement: "'",
        enabled: true
      },
      {
        name: "Smart Double Quotes",
        description: "Replace smart double quotes with standard quotation marks",
        type: "replace",
        pattern: "U+201C–U+201F, U+2033, U+2036, U+00AB, U+00BB",
        replacement: "\"",
        enabled: true
      },
      {
        name: "Ellipsis",
        description: "Replace ellipsis character with periods",
        type: "replace",
        pattern: "U+2026",
        replacement: "...",
        enabled: true
      },
      {
        name: "Remove Invisibles",
        description: "Remove invisible Unicode characters",
        type: "remove",
        pattern: "U+00AD, U+180E, U+200B–U+200F, U+202A–U+202E, U+2060–U+206F, U+FE00–U+FE0F, U+FEFF",
        replacement: "",
        enabled: true
      }
    ];
    
    const ruleIds = [];
    
    for (const rule of defaultRules) {
      const id = this.ruleId++;
      const newRule: Rule = {
        id,
        userId: null,
        ...rule,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.rules.set(id, newRule);
      ruleIds.push(id);
    }
    
    // Add default preset
    const presetId = this.presetId++;
    const defaultPreset: Preset = {
      id: presetId,
      userId: null,
      name: "Default Preset",
      ruleIds: ruleIds,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.presets.set(presetId, defaultPreset);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, user);
    return user;
  }

  // Rule methods
  async getRule(id: number): Promise<Rule | undefined> {
    return this.rules.get(id);
  }

  async getRules(): Promise<Rule[]> {
    return Array.from(this.rules.values());
  }

  async createRule(insertRule: InsertRule): Promise<Rule> {
    const id = this.ruleId++;
    const rule: Rule = {
      ...insertRule,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.rules.set(id, rule);
    return rule;
  }

  async updateRule(id: number, updateRule: InsertRule): Promise<Rule | undefined> {
    const rule = this.rules.get(id);
    if (!rule) {
      return undefined;
    }
    
    const updatedRule: Rule = {
      ...rule,
      ...updateRule,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.rules.set(id, updatedRule);
    return updatedRule;
  }

  async deleteRule(id: number): Promise<boolean> {
    if (!this.rules.has(id)) {
      return false;
    }
    
    this.rules.delete(id);
    
    // Update any presets that referenced this rule
    for (const preset of this.presets.values()) {
      if (preset.ruleIds.includes(id)) {
        preset.ruleIds = preset.ruleIds.filter(ruleId => ruleId !== id);
        preset.updatedAt = new Date().toISOString();
      }
    }
    
    return true;
  }

  // Preset methods
  async getPreset(id: number): Promise<Preset | undefined> {
    return this.presets.get(id);
  }

  async getPresets(): Promise<Preset[]> {
    return Array.from(this.presets.values());
  }

  async createPreset(insertPreset: InsertPreset): Promise<Preset> {
    const id = this.presetId++;
    
    // If this is set as default, unset other defaults
    if (insertPreset.isDefault) {
      for (const preset of this.presets.values()) {
        if (preset.isDefault) {
          preset.isDefault = false;
          preset.updatedAt = new Date().toISOString();
        }
      }
    }
    
    const preset: Preset = {
      ...insertPreset,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.presets.set(id, preset);
    return preset;
  }

  async updatePreset(id: number, updatePreset: InsertPreset): Promise<Preset | undefined> {
    const preset = this.presets.get(id);
    if (!preset) {
      return undefined;
    }
    
    // If this is being set as default, unset other defaults
    if (updatePreset.isDefault && !preset.isDefault) {
      for (const p of this.presets.values()) {
        if (p.isDefault && p.id !== id) {
          p.isDefault = false;
          p.updatedAt = new Date().toISOString();
        }
      }
    }
    
    const updatedPreset: Preset = {
      ...preset,
      ...updatePreset,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.presets.set(id, updatedPreset);
    return updatedPreset;
  }

  async deletePreset(id: number): Promise<boolean> {
    const preset = this.presets.get(id);
    if (!preset) {
      return false;
    }
    
    // Don't allow deletion if it's the only preset or if it's the default
    const presetCount = this.presets.size;
    if (presetCount === 1 || preset.isDefault) {
      return false;
    }
    
    this.presets.delete(id);
    return true;
  }

  // Detection log methods
  async createDetectionLog(insertLog: InsertDetectionLog): Promise<DetectionLog> {
    const id = this.logId++;
    const log: DetectionLog = {
      ...insertLog,
      id,
      createdAt: new Date().toISOString()
    };
    
    this.detectionLogs.set(id, log);
    return log;
  }

  async getDetectionLogs(userId?: number): Promise<DetectionLog[]> {
    const logs = Array.from(this.detectionLogs.values());
    
    if (userId !== undefined) {
      return logs.filter(log => log.userId === userId);
    }
    
    return logs;
  }
}

export const storage = new MemStorage();
