import { Job } from '../schemas/dataModel.js';
export interface RubricScores {
    salesEngineerFit: number;
    compensation: number;
    technicalDepth: number;
    dealComplexity: number;
    remote: number;
    revenueScope: number;
    industry: number;
}
export interface EvaluatorDeduction {
    category: string;
    points_deducted: number;
    reason_code: string;
    evidence_excerpt: string;
}
export interface EvaluatorResult {
    total_score: number;
    proceed: boolean;
    deductions: EvaluatorDeduction[];
    strike_zone_rationale: string;
    recruiter_questions: string[];
    unknown_fields: string[];
}
/**
 * Calculates the overall FitScore.
 * Inputs to this function should be normalized between 0.0 and 1.0
 * based on the Vertex AI extraction outputs.
 */
export declare function calculateFitScore(rubricScores: RubricScores): number;
export declare function calculateSubtractiveFitScore(deductions: EvaluatorDeduction[]): number;
export declare function isQualified(fitScore: number): boolean;
export declare function checkDisqualifiers(job: Job): {
    disqualified: boolean;
    reasons: string[];
};
/**
 * Search Intensity Engine MVP Formula
 * Effort = targeted apps + outbound sends + followups + proof pack shipped
 * Conversion = interviews / meaningful conversations
 * Target Value = average pursued FitScore weighted by comp confidence
 * Intensity = normalize(Effort) * normalize(Conversion) * normalize(Target Value)
 */
export declare function calculateSearchIntensity(metrics: {
    applications: number;
    outbounds: number;
    followups: number;
    proofPacks: number;
    interviews: number;
    meaningfulConversations: number;
    avgFitScore: number;
    compConfidenceWeight: number;
}): number;
