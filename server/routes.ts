import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertRuleSchema, insertPresetSchema, insertDetectionLogSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API router
  const apiRouter = express.Router();

  // Health check endpoint
  apiRouter.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // User routes
  apiRouter.post("/users", async (req: Request, res: Response) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Rules endpoints
  apiRouter.get("/rules", async (req: Request, res: Response) => {
    try {
      const rules = await storage.getRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  apiRouter.post("/rules", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRuleSchema.parse(req.body);
      const rule = await storage.createRule(validatedData);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  });

  apiRouter.put("/rules/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRuleSchema.parse(req.body);
      const rule = await storage.updateRule(id, validatedData);
      if (!rule) {
        return res.status(404).json({ error: "Rule not found" });
      }
      res.json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  });

  apiRouter.delete("/rules/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRule(id);
      if (!success) {
        return res.status(404).json({ error: "Rule not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Presets endpoints
  apiRouter.get("/presets", async (req: Request, res: Response) => {
    try {
      const presets = await storage.getPresets();
      res.json(presets);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  apiRouter.post("/presets", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPresetSchema.parse(req.body);
      const preset = await storage.createPreset(validatedData);
      res.status(201).json(preset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  });

  apiRouter.put("/presets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPresetSchema.parse(req.body);
      const preset = await storage.updatePreset(id, validatedData);
      if (!preset) {
        return res.status(404).json({ error: "Preset not found" });
      }
      res.json(preset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  });

  apiRouter.delete("/presets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePreset(id);
      if (!success) {
        return res.status(404).json({ error: "Preset not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Detection logs endpoint
  apiRouter.post("/detection-logs", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDetectionLogSchema.parse(req.body);
      const log = await storage.createDetectionLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  });

  // AI detection endpoint (mock for now)
  apiRouter.post("/detect", (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Valid text is required" });
      }
      
      // Simple algorithm to generate a human-likeness score
      const wordCount = text.split(/\s+/).length;
      const sentenceCount = text.split(/[.!?]+/).length;
      
      // Longer text with varied sentence structure tends to score higher
      const baseScore = 0.4 + (Math.min(wordCount, 500) / 500) * 0.3;
      const randomFactor = Math.random() * 0.2;
      
      // Final score as percentage
      const humanLikenessScore = Math.min(95, Math.max(30, (baseScore + randomFactor) * 100));
      
      res.json({
        aggregateScore: Math.round(humanLikenessScore),
        results: [
          {
            humanLikenessScore: Math.round(humanLikenessScore),
            source: "GPTZero",
            rawScore: baseScore,
            confidence: 0.8
          },
          {
            humanLikenessScore: Math.round(humanLikenessScore + (Math.random() * 10 - 5)),
            source: "Sapling",
            rawScore: baseScore + randomFactor,
            confidence: 0.7
          }
        ],
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Use the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}
