import { z } from 'zod';
export declare const ProofPackSchema: z.ZodObject<{
    artifact_id: z.ZodString;
    type: z.ZodEnum<["case_study", "systems_diagram", "30_60_90", "work_sample"]>;
    uri: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    redaction_level: z.ZodString;
    allowed: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    tags: string[];
    type: "case_study" | "systems_diagram" | "30_60_90" | "work_sample";
    artifact_id: string;
    uri: string;
    redaction_level: string;
    allowed: boolean;
}, {
    tags: string[];
    type: "case_study" | "systems_diagram" | "30_60_90" | "work_sample";
    artifact_id: string;
    uri: string;
    redaction_level: string;
    allowed: boolean;
}>;
export type ProofPackEntry = z.infer<typeof ProofPackSchema>;
