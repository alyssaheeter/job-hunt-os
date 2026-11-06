import { z } from 'zod';
export declare const AgentSukiPayloadSchema: z.ZodObject<{
    _chain_of_thought: z.ZodString;
    summary: z.ZodString;
    independent_consultancy_bullets: z.ZodArray<z.ZodObject<{
        fact_id: z.ZodString;
        outcome_metric: z.ZodString;
        mechanism: z.ZodString;
        scope: z.ZodString;
        tooling: z.ZodString;
        role: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        verified: z.ZodBoolean;
        proof_uri: z.ZodOptional<z.ZodString>;
        last_updated: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }, {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }>, "many">;
    ahead_bullets: z.ZodArray<z.ZodObject<{
        fact_id: z.ZodString;
        outcome_metric: z.ZodString;
        mechanism: z.ZodString;
        scope: z.ZodString;
        tooling: z.ZodString;
        role: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        verified: z.ZodBoolean;
        proof_uri: z.ZodOptional<z.ZodString>;
        last_updated: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }, {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }>, "many">;
    att_cse_bullets: z.ZodArray<z.ZodObject<{
        fact_id: z.ZodString;
        outcome_metric: z.ZodString;
        mechanism: z.ZodString;
        scope: z.ZodString;
        tooling: z.ZodString;
        role: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        verified: z.ZodBoolean;
        proof_uri: z.ZodOptional<z.ZodString>;
        last_updated: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }, {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }>, "many">;
    att_b2b_bullets: z.ZodArray<z.ZodObject<{
        fact_id: z.ZodString;
        outcome_metric: z.ZodString;
        mechanism: z.ZodString;
        scope: z.ZodString;
        tooling: z.ZodString;
        role: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        verified: z.ZodBoolean;
        proof_uri: z.ZodOptional<z.ZodString>;
        last_updated: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }, {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }>, "many">;
    skills: z.ZodArray<z.ZodObject<{
        cluster_name: z.ZodString;
        keywords: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        cluster_name: string;
        keywords: string[];
    }, {
        cluster_name: string;
        keywords: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    _chain_of_thought: string;
    summary: string;
    independent_consultancy_bullets: {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }[];
    ahead_bullets: {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }[];
    att_cse_bullets: {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }[];
    att_b2b_bullets: {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }[];
    skills: {
        cluster_name: string;
        keywords: string[];
    }[];
}, {
    _chain_of_thought: string;
    summary: string;
    independent_consultancy_bullets: {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }[];
    ahead_bullets: {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }[];
    att_cse_bullets: {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }[];
    att_b2b_bullets: {
        fact_id: string;
        outcome_metric: string;
        mechanism: string;
        scope: string;
        tooling: string;
        role: string;
        tags: string[];
        verified: boolean;
        proof_uri?: string | undefined;
        last_updated?: string | undefined;
    }[];
    skills: {
        cluster_name: string;
        keywords: string[];
    }[];
}>;
export type AgentSukiPayload = z.infer<typeof AgentSukiPayloadSchema>;
