import { z } from 'zod';
export declare const FactEntrySchema: z.ZodObject<{
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
}>;
export type FactEntry = z.infer<typeof FactEntrySchema>;
export declare const JobSchema: z.ZodObject<{
    jobId: z.ZodString;
    tenantId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["INGESTED", "PREPROCESSED", "NORMALIZED", "DISQUALIFIED", "EVALUATED", "REJECTED", "APPROVED", "GENERATED", "RENDERED", "DRAFTED", "ERROR"]>>;
    source: z.ZodObject<{
        channel: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        posting_date: z.ZodOptional<z.ZodString>;
        posting_age: z.ZodOptional<z.ZodNumber>;
        applicant_count_hint: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        channel: string;
        url?: string | undefined;
        posting_date?: string | undefined;
        posting_age?: number | undefined;
        applicant_count_hint?: number | undefined;
    }, {
        channel: string;
        url?: string | undefined;
        posting_date?: string | undefined;
        posting_age?: number | undefined;
        applicant_count_hint?: number | undefined;
    }>;
    company: z.ZodObject<{
        industry: z.ZodString;
        stage: z.ZodString;
        size: z.ZodString;
        hq: z.ZodString;
        scale_friction_signals: z.ZodArray<z.ZodString, "many">;
        evidence_excerpts: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        industry: string;
        stage: string;
        size: string;
        hq: string;
        scale_friction_signals: string[];
        evidence_excerpts: string[];
    }, {
        industry: string;
        stage: string;
        size: string;
        hq: string;
        scale_friction_signals: string[];
        evidence_excerpts: string[];
    }>;
    role: z.ZodObject<{
        title: z.ZodString;
        role_family: z.ZodString;
        seniority: z.ZodString;
        employment_type: z.ZodString;
        manager_title_hint: z.ZodOptional<z.ZodString>;
        target_ats_title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        role_family: string;
        seniority: string;
        employment_type: string;
        target_ats_title: string;
        manager_title_hint?: string | undefined;
    }, {
        title: string;
        role_family: string;
        seniority: string;
        employment_type: string;
        target_ats_title: string;
        manager_title_hint?: string | undefined;
    }>;
    location: z.ZodObject<{
        work_mode: z.ZodEnum<["remote", "hybrid", "onsite", "unknown"]>;
        geo_requirement: z.ZodString;
        onsite_days: z.ZodNumber;
        travel_percent: z.ZodOptional<z.ZodNumber>;
        travel_profile: z.ZodOptional<z.ZodObject<{
            regional_max: z.ZodNumber;
            global_max: z.ZodNumber;
            travel_inference_basis: z.ZodString;
            travel_confidence: z.ZodEnum<["high", "inferred", "low"]>;
        }, "strip", z.ZodTypeAny, {
            regional_max: number;
            global_max: number;
            travel_inference_basis: string;
            travel_confidence: "high" | "inferred" | "low";
        }, {
            regional_max: number;
            global_max: number;
            travel_inference_basis: string;
            travel_confidence: "high" | "inferred" | "low";
        }>>;
        excerpt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        work_mode: "unknown" | "remote" | "hybrid" | "onsite";
        geo_requirement: string;
        onsite_days: number;
        excerpt: string;
        travel_percent?: number | undefined;
        travel_profile?: {
            regional_max: number;
            global_max: number;
            travel_inference_basis: string;
            travel_confidence: "high" | "inferred" | "low";
        } | undefined;
    }, {
        work_mode: "unknown" | "remote" | "hybrid" | "onsite";
        geo_requirement: string;
        onsite_days: number;
        excerpt: string;
        travel_percent?: number | undefined;
        travel_profile?: {
            regional_max: number;
            global_max: number;
            travel_inference_basis: string;
            travel_confidence: "high" | "inferred" | "low";
        } | undefined;
    }>;
    compensation: z.ZodObject<{
        base_min: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        base_max: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        ote_min: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        ote_max: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        split: z.ZodOptional<z.ZodString>;
        equity: z.ZodBoolean;
        confidence: z.ZodEnum<["high", "medium", "low_missing"]>;
        excerpt_lines: z.ZodArray<z.ZodString, "many">;
        comp_excerpts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        missing_fields: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        equity: boolean;
        confidence: "high" | "medium" | "low_missing";
        excerpt_lines: string[];
        missing_fields: string[];
        base_min?: number | null | undefined;
        base_max?: number | null | undefined;
        ote_min?: number | null | undefined;
        ote_max?: number | null | undefined;
        split?: string | undefined;
        comp_excerpts?: string[] | undefined;
    }, {
        equity: boolean;
        confidence: "high" | "medium" | "low_missing";
        excerpt_lines: string[];
        missing_fields: string[];
        base_min?: number | null | undefined;
        base_max?: number | null | undefined;
        ote_min?: number | null | undefined;
        ote_max?: number | null | undefined;
        split?: string | undefined;
        comp_excerpts?: string[] | undefined;
    }>;
    ats_requirements: z.ZodObject<{
        must_haves: z.ZodArray<z.ZodString, "many">;
        nice_to_haves: z.ZodArray<z.ZodString, "many">;
        tools_platforms: z.ZodArray<z.ZodString, "many">;
        domains: z.ZodArray<z.ZodString, "many">;
        keywords_to_mirror: z.ZodArray<z.ZodString, "many">;
        validated_skill_clusters: z.ZodArray<z.ZodObject<{
            cluster: z.ZodString;
            terms: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            cluster: string;
            terms: string[];
        }, {
            cluster: string;
            terms: string[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        must_haves: string[];
        nice_to_haves: string[];
        tools_platforms: string[];
        domains: string[];
        keywords_to_mirror: string[];
        validated_skill_clusters: {
            cluster: string;
            terms: string[];
        }[];
    }, {
        must_haves: string[];
        nice_to_haves: string[];
        tools_platforms: string[];
        domains: string[];
        keywords_to_mirror: string[];
        validated_skill_clusters: {
            cluster: string;
            terms: string[];
        }[];
    }>;
    scope_signals: z.ZodObject<{
        discovery_ownership: z.ZodBoolean;
        demo_expectation: z.ZodBoolean;
        enterprise_motion: z.ZodBoolean;
        cross_functional: z.ZodBoolean;
        revops_component: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        discovery_ownership: boolean;
        demo_expectation: boolean;
        enterprise_motion: boolean;
        cross_functional: boolean;
        revops_component: boolean;
    }, {
        discovery_ownership: boolean;
        demo_expectation: boolean;
        enterprise_motion: boolean;
        cross_functional: boolean;
        revops_component: boolean;
    }>;
    risk_flags: z.ZodObject<{
        pure_ae: z.ZodBoolean;
        demo_monkey_risk: z.ZodBoolean;
        internal_it_support: z.ZodBoolean;
        heavy_travel: z.ZodBoolean;
        comp_below_floor: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        pure_ae: boolean;
        demo_monkey_risk: boolean;
        internal_it_support: boolean;
        heavy_travel: boolean;
        comp_below_floor: boolean;
    }, {
        pure_ae: boolean;
        demo_monkey_risk: boolean;
        internal_it_support: boolean;
        heavy_travel: boolean;
        comp_below_floor: boolean;
    }>;
    negotiation_levers: z.ZodOptional<z.ZodObject<{
        market_duration_days: z.ZodOptional<z.ZodNumber>;
        comp_flexibility_signals: z.ZodArray<z.ZodString, "many">;
        urgency_flags: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        comp_flexibility_signals: string[];
        urgency_flags: string[];
        market_duration_days?: number | undefined;
    }, {
        comp_flexibility_signals: string[];
        urgency_flags: string[];
        market_duration_days?: number | undefined;
    }>>;
    operator_affinity_score: z.ZodOptional<z.ZodBoolean>;
    raw_storage: z.ZodObject<{
        gcs_uri: z.ZodString;
        content_hash: z.ZodString;
        stable_fingerprint: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        gcs_uri: string;
        content_hash: string;
        stable_fingerprint?: string | undefined;
    }, {
        gcs_uri: string;
        content_hash: string;
        stable_fingerprint?: string | undefined;
    }>;
    versions: z.ZodObject<{
        normalizer_version: z.ZodString;
        rubric_version: z.ZodString;
        prompt_version: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        normalizer_version: string;
        rubric_version: string;
        prompt_version: string;
    }, {
        normalizer_version: string;
        rubric_version: string;
        prompt_version: string;
    }>;
    timestamps: z.ZodObject<{
        ingested_at: z.ZodString;
        updated_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ingested_at: string;
        updated_at: string;
    }, {
        ingested_at: string;
        updated_at: string;
    }>;
}, "strip", z.ZodTypeAny, {
    role: {
        title: string;
        role_family: string;
        seniority: string;
        employment_type: string;
        target_ats_title: string;
        manager_title_hint?: string | undefined;
    };
    status: "INGESTED" | "PREPROCESSED" | "NORMALIZED" | "DISQUALIFIED" | "EVALUATED" | "REJECTED" | "APPROVED" | "GENERATED" | "RENDERED" | "DRAFTED" | "ERROR";
    jobId: string;
    tenantId: string;
    source: {
        channel: string;
        url?: string | undefined;
        posting_date?: string | undefined;
        posting_age?: number | undefined;
        applicant_count_hint?: number | undefined;
    };
    company: {
        industry: string;
        stage: string;
        size: string;
        hq: string;
        scale_friction_signals: string[];
        evidence_excerpts: string[];
    };
    location: {
        work_mode: "unknown" | "remote" | "hybrid" | "onsite";
        geo_requirement: string;
        onsite_days: number;
        excerpt: string;
        travel_percent?: number | undefined;
        travel_profile?: {
            regional_max: number;
            global_max: number;
            travel_inference_basis: string;
            travel_confidence: "high" | "inferred" | "low";
        } | undefined;
    };
    compensation: {
        equity: boolean;
        confidence: "high" | "medium" | "low_missing";
        excerpt_lines: string[];
        missing_fields: string[];
        base_min?: number | null | undefined;
        base_max?: number | null | undefined;
        ote_min?: number | null | undefined;
        ote_max?: number | null | undefined;
        split?: string | undefined;
        comp_excerpts?: string[] | undefined;
    };
    ats_requirements: {
        must_haves: string[];
        nice_to_haves: string[];
        tools_platforms: string[];
        domains: string[];
        keywords_to_mirror: string[];
        validated_skill_clusters: {
            cluster: string;
            terms: string[];
        }[];
    };
    scope_signals: {
        discovery_ownership: boolean;
        demo_expectation: boolean;
        enterprise_motion: boolean;
        cross_functional: boolean;
        revops_component: boolean;
    };
    risk_flags: {
        pure_ae: boolean;
        demo_monkey_risk: boolean;
        internal_it_support: boolean;
        heavy_travel: boolean;
        comp_below_floor: boolean;
    };
    raw_storage: {
        gcs_uri: string;
        content_hash: string;
        stable_fingerprint?: string | undefined;
    };
    versions: {
        normalizer_version: string;
        rubric_version: string;
        prompt_version: string;
    };
    timestamps: {
        ingested_at: string;
        updated_at: string;
    };
    negotiation_levers?: {
        comp_flexibility_signals: string[];
        urgency_flags: string[];
        market_duration_days?: number | undefined;
    } | undefined;
    operator_affinity_score?: boolean | undefined;
}, {
    role: {
        title: string;
        role_family: string;
        seniority: string;
        employment_type: string;
        target_ats_title: string;
        manager_title_hint?: string | undefined;
    };
    jobId: string;
    tenantId: string;
    source: {
        channel: string;
        url?: string | undefined;
        posting_date?: string | undefined;
        posting_age?: number | undefined;
        applicant_count_hint?: number | undefined;
    };
    company: {
        industry: string;
        stage: string;
        size: string;
        hq: string;
        scale_friction_signals: string[];
        evidence_excerpts: string[];
    };
    location: {
        work_mode: "unknown" | "remote" | "hybrid" | "onsite";
        geo_requirement: string;
        onsite_days: number;
        excerpt: string;
        travel_percent?: number | undefined;
        travel_profile?: {
            regional_max: number;
            global_max: number;
            travel_inference_basis: string;
            travel_confidence: "high" | "inferred" | "low";
        } | undefined;
    };
    compensation: {
        equity: boolean;
        confidence: "high" | "medium" | "low_missing";
        excerpt_lines: string[];
        missing_fields: string[];
        base_min?: number | null | undefined;
        base_max?: number | null | undefined;
        ote_min?: number | null | undefined;
        ote_max?: number | null | undefined;
        split?: string | undefined;
        comp_excerpts?: string[] | undefined;
    };
    ats_requirements: {
        must_haves: string[];
        nice_to_haves: string[];
        tools_platforms: string[];
        domains: string[];
        keywords_to_mirror: string[];
        validated_skill_clusters: {
            cluster: string;
            terms: string[];
        }[];
    };
    scope_signals: {
        discovery_ownership: boolean;
        demo_expectation: boolean;
        enterprise_motion: boolean;
        cross_functional: boolean;
        revops_component: boolean;
    };
    risk_flags: {
        pure_ae: boolean;
        demo_monkey_risk: boolean;
        internal_it_support: boolean;
        heavy_travel: boolean;
        comp_below_floor: boolean;
    };
    raw_storage: {
        gcs_uri: string;
        content_hash: string;
        stable_fingerprint?: string | undefined;
    };
    versions: {
        normalizer_version: string;
        rubric_version: string;
        prompt_version: string;
    };
    timestamps: {
        ingested_at: string;
        updated_at: string;
    };
    status?: "INGESTED" | "PREPROCESSED" | "NORMALIZED" | "DISQUALIFIED" | "EVALUATED" | "REJECTED" | "APPROVED" | "GENERATED" | "RENDERED" | "DRAFTED" | "ERROR" | undefined;
    negotiation_levers?: {
        comp_flexibility_signals: string[];
        urgency_flags: string[];
        market_duration_days?: number | undefined;
    } | undefined;
    operator_affinity_score?: boolean | undefined;
}>;
export type Job = z.infer<typeof JobSchema>;
export declare const ScoringRunSchema: z.ZodObject<{
    runId: z.ZodString;
    jobId: z.ZodString;
    tenantId: z.ZodString;
    inputHash: z.ZodString;
    status: z.ZodEnum<["RUNNING", "SUCCESS", "FAILED"]>;
    total_score: z.ZodOptional<z.ZodNumber>;
    breakdown_per_category: z.ZodOptional<z.ZodObject<{
        salesEngineerFit: z.ZodNumber;
        compensation: z.ZodNumber;
        technicalDepth: z.ZodNumber;
        dealComplexity: z.ZodNumber;
        remote: z.ZodNumber;
        revenueScope: z.ZodNumber;
        industry: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        industry: number;
        remote: number;
        compensation: number;
        salesEngineerFit: number;
        technicalDepth: number;
        dealComplexity: number;
        revenueScope: number;
    }, {
        industry: number;
        remote: number;
        compensation: number;
        salesEngineerFit: number;
        technicalDepth: number;
        dealComplexity: number;
        revenueScope: number;
    }>>;
    evidence_from_jd: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    evidence_from_facts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    unknown_fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    risks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    keywords_to_mirror: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "RUNNING" | "SUCCESS" | "FAILED";
    jobId: string;
    tenantId: string;
    runId: string;
    inputHash: string;
    generatedAt: string;
    keywords_to_mirror?: string[] | undefined;
    total_score?: number | undefined;
    breakdown_per_category?: {
        industry: number;
        remote: number;
        compensation: number;
        salesEngineerFit: number;
        technicalDepth: number;
        dealComplexity: number;
        revenueScope: number;
    } | undefined;
    evidence_from_jd?: string[] | undefined;
    evidence_from_facts?: string[] | undefined;
    unknown_fields?: string[] | undefined;
    risks?: string[] | undefined;
}, {
    status: "RUNNING" | "SUCCESS" | "FAILED";
    jobId: string;
    tenantId: string;
    runId: string;
    inputHash: string;
    generatedAt: string;
    keywords_to_mirror?: string[] | undefined;
    total_score?: number | undefined;
    breakdown_per_category?: {
        industry: number;
        remote: number;
        compensation: number;
        salesEngineerFit: number;
        technicalDepth: number;
        dealComplexity: number;
        revenueScope: number;
    } | undefined;
    evidence_from_jd?: string[] | undefined;
    evidence_from_facts?: string[] | undefined;
    unknown_fields?: string[] | undefined;
    risks?: string[] | undefined;
}>;
export type ScoringRun = z.infer<typeof ScoringRunSchema>;
export declare const PromptRunLogSchema: z.ZodObject<{
    logId: z.ZodString;
    runId: z.ZodString;
    tenantId: z.ZodString;
    timestamp: z.ZodString;
    model: z.ZodString;
    promptType: z.ZodString;
    requestPayload: z.ZodAny;
    responsePayload: z.ZodAny;
    error: z.ZodOptional<z.ZodString>;
    schemaViolation: z.ZodDefault<z.ZodBoolean>;
    cache_id: z.ZodOptional<z.ZodString>;
    cache_hit: z.ZodDefault<z.ZodBoolean>;
    input_tokens: z.ZodOptional<z.ZodNumber>;
    output_tokens: z.ZodOptional<z.ZodNumber>;
    latency_ms: z.ZodOptional<z.ZodNumber>;
    cost_estimate: z.ZodOptional<z.ZodNumber>;
    prompt_version: z.ZodOptional<z.ZodString>;
    schema_version: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    runId: string;
    logId: string;
    timestamp: string;
    model: string;
    promptType: string;
    schemaViolation: boolean;
    cache_hit: boolean;
    prompt_version?: string | undefined;
    requestPayload?: any;
    responsePayload?: any;
    error?: string | undefined;
    cache_id?: string | undefined;
    input_tokens?: number | undefined;
    output_tokens?: number | undefined;
    latency_ms?: number | undefined;
    cost_estimate?: number | undefined;
    schema_version?: string | undefined;
}, {
    tenantId: string;
    runId: string;
    logId: string;
    timestamp: string;
    model: string;
    promptType: string;
    prompt_version?: string | undefined;
    requestPayload?: any;
    responsePayload?: any;
    error?: string | undefined;
    schemaViolation?: boolean | undefined;
    cache_id?: string | undefined;
    cache_hit?: boolean | undefined;
    input_tokens?: number | undefined;
    output_tokens?: number | undefined;
    latency_ms?: number | undefined;
    cost_estimate?: number | undefined;
    schema_version?: string | undefined;
}>;
export type PromptRunLog = z.infer<typeof PromptRunLogSchema>;
export declare const ApplicationSchema: z.ZodObject<{
    applicationId: z.ZodString;
    jobId: z.ZodString;
    tenantId: z.ZodString;
    status: z.ZodEnum<["DRAFTED", "SUBMITTED", "REJECTED", "INTERVIEWING", "OFFER", "CLOSED"]>;
    generation_logs: z.ZodArray<z.ZodObject<{
        bullet_text: z.ZodString;
        source_fact_id: z.ZodString;
        jd_keyword_matched: z.ZodOptional<z.ZodString>;
        cluster_name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        bullet_text: string;
        source_fact_id: string;
        jd_keyword_matched?: string | undefined;
        cluster_name?: string | undefined;
    }, {
        bullet_text: string;
        source_fact_id: string;
        jd_keyword_matched?: string | undefined;
        cluster_name?: string | undefined;
    }>, "many">;
    assets: z.ZodObject<{
        resume_gcs_uri: z.ZodString;
        cover_letter_gcs_uri: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        resume_gcs_uri: string;
        cover_letter_gcs_uri?: string | undefined;
    }, {
        resume_gcs_uri: string;
        cover_letter_gcs_uri?: string | undefined;
    }>;
    comms_sequence: z.ZodArray<z.ZodObject<{
        day: z.ZodNumber;
        draft_id: z.ZodString;
        status: z.ZodEnum<["PENDING", "SENT"]>;
    }, "strip", z.ZodTypeAny, {
        status: "PENDING" | "SENT";
        day: number;
        draft_id: string;
    }, {
        status: "PENDING" | "SENT";
        day: number;
        draft_id: string;
    }>, "many">;
    timestamps: z.ZodObject<{
        created_at: z.ZodString;
        updated_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        updated_at: string;
        created_at: string;
    }, {
        updated_at: string;
        created_at: string;
    }>;
}, "strip", z.ZodTypeAny, {
    status: "REJECTED" | "DRAFTED" | "SUBMITTED" | "INTERVIEWING" | "OFFER" | "CLOSED";
    jobId: string;
    tenantId: string;
    timestamps: {
        updated_at: string;
        created_at: string;
    };
    applicationId: string;
    generation_logs: {
        bullet_text: string;
        source_fact_id: string;
        jd_keyword_matched?: string | undefined;
        cluster_name?: string | undefined;
    }[];
    assets: {
        resume_gcs_uri: string;
        cover_letter_gcs_uri?: string | undefined;
    };
    comms_sequence: {
        status: "PENDING" | "SENT";
        day: number;
        draft_id: string;
    }[];
}, {
    status: "REJECTED" | "DRAFTED" | "SUBMITTED" | "INTERVIEWING" | "OFFER" | "CLOSED";
    jobId: string;
    tenantId: string;
    timestamps: {
        updated_at: string;
        created_at: string;
    };
    applicationId: string;
    generation_logs: {
        bullet_text: string;
        source_fact_id: string;
        jd_keyword_matched?: string | undefined;
        cluster_name?: string | undefined;
    }[];
    assets: {
        resume_gcs_uri: string;
        cover_letter_gcs_uri?: string | undefined;
    };
    comms_sequence: {
        status: "PENDING" | "SENT";
        day: number;
        draft_id: string;
    }[];
}>;
export type Application = z.infer<typeof ApplicationSchema>;
