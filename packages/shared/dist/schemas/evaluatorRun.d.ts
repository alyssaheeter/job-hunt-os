import { z } from 'zod';
export declare const EvaluatorDeductionSchema: z.ZodObject<{
    category: z.ZodString;
    points_deducted: z.ZodNumber;
    reason_code: z.ZodString;
    evidence_excerpt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    category: string;
    points_deducted: number;
    reason_code: string;
    evidence_excerpt: string;
}, {
    category: string;
    points_deducted: number;
    reason_code: string;
    evidence_excerpt: string;
}>;
export declare const EvaluatorResultSchema: z.ZodObject<{
    total_score: z.ZodNumber;
    proceed: z.ZodBoolean;
    deductions: z.ZodArray<z.ZodObject<{
        category: z.ZodString;
        points_deducted: z.ZodNumber;
        reason_code: z.ZodString;
        evidence_excerpt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        category: string;
        points_deducted: number;
        reason_code: string;
        evidence_excerpt: string;
    }, {
        category: string;
        points_deducted: number;
        reason_code: string;
        evidence_excerpt: string;
    }>, "many">;
    strike_zone_rationale: z.ZodString;
    recruiter_questions: z.ZodArray<z.ZodString, "many">;
    unknown_fields: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    total_score: number;
    unknown_fields: string[];
    proceed: boolean;
    deductions: {
        category: string;
        points_deducted: number;
        reason_code: string;
        evidence_excerpt: string;
    }[];
    strike_zone_rationale: string;
    recruiter_questions: string[];
}, {
    total_score: number;
    unknown_fields: string[];
    proceed: boolean;
    deductions: {
        category: string;
        points_deducted: number;
        reason_code: string;
        evidence_excerpt: string;
    }[];
    strike_zone_rationale: string;
    recruiter_questions: string[];
}>;
export type EvaluatorResultSchemaType = z.infer<typeof EvaluatorResultSchema>;
