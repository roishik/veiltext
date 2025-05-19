import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for when authentication is implemented
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull().default("NOW()"),
});

// Rules table for storing custom transformation rules
export const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  pattern: text("pattern").notNull(),
  replacement: text("replacement"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: text("created_at").notNull().default("NOW()"),
  updatedAt: text("updated_at").notNull().default("NOW()"),
});

// Presets table for storing rule presets
export const presets = pgTable("presets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  ruleIds: json("rule_ids").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: text("created_at").notNull().default("NOW()"),
  updatedAt: text("updated_at").notNull().default("NOW()"),
});

// Detection logs for analytics
export const detectionLogs = pgTable("detection_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  textLength: integer("text_length").notNull(),
  originalScore: integer("original_score"),
  cleanedScore: integer("cleaned_score"),
  detectorName: text("detector_name"),
  createdAt: text("created_at").notNull().default("NOW()"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertRuleSchema = createInsertSchema(rules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPresetSchema = createInsertSchema(presets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDetectionLogSchema = createInsertSchema(detectionLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRule = z.infer<typeof insertRuleSchema>;
export type Rule = typeof rules.$inferSelect;

export type InsertPreset = z.infer<typeof insertPresetSchema>;
export type Preset = typeof presets.$inferSelect;

export type InsertDetectionLog = z.infer<typeof insertDetectionLogSchema>;
export type DetectionLog = typeof detectionLogs.$inferSelect;
