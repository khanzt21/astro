import { z } from "zod";

export const ForecastSchema = z.object({
  language: z.enum(["ru","en"]),
  summary: z.string(),
  themes: z.array(z.object({ topic: z.string(), text: z.string() })),
  timing: z.object({ from: z.string(), to: z.string() }),
  advice: z.array(z.string()).default([]),
  risk_level: z.number().min(1).max(5),
  confidence: z.number().min(0).max(1),
  disclaimers: z.array(z.string()).optional()
});

export type ForecastPayload = z.infer<typeof ForecastSchema>;
