import { z } from 'zod';

export const EvaluatorDeductionSchema = z.object({
    category: z.string(),
    points_deducted: z.number(),
    reason_code: z.string(),
    evidence_excerpt: z.string()
});

export const EvaluatorResultSchema = z.object({
    total_score: z.number(),
    proceed: z.boolean(),
    deductions: z.array(EvaluatorDeductionSchema),
    strike_zone_rationale: z.string(),
    recruiter_questions: z.array(z.string()),
    unknown_fields: z.array(z.string())
});

export type EvaluatorResultSchemaType = z.infer<typeof EvaluatorResultSchema>;
