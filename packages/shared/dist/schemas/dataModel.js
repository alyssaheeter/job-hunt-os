import { z } from 'zod';
export const FactEntrySchema = z.object({
    fact_id: z.string(),
    outcome_metric: z.string(),
    mechanism: z.string(),
    scope: z.string(),
    tooling: z.string(),
    role: z.string(),
    tags: z.array(z.string()),
    verified: z.boolean(),
    proof_uri: z.string().optional(),
    last_updated: z.string().optional()
});
export const JobSchema = z.object({
    jobId: z.string(),
    tenantId: z.string(),
    status: z.enum(['INGESTED', 'PREPROCESSED', 'NORMALIZED', 'DISQUALIFIED', 'EVALUATED', 'REJECTED', 'APPROVED', 'GENERATED', 'RENDERED', 'DRAFTED', 'ERROR']).default('INGESTED'),
    source: z.object({
        channel: z.string(),
        url: z.string().optional(),
        posting_date: z.string().optional(),
        posting_age: z.number().optional(),
        applicant_count_hint: z.number().optional()
    }),
    company: z.object({
        industry: z.string(),
        stage: z.string(),
        size: z.string(),
        hq: z.string(),
        scale_friction_signals: z.array(z.string()),
        evidence_excerpts: z.array(z.string())
    }),
    role: z.object({
        title: z.string(),
        role_family: z.string(),
        seniority: z.string(),
        employment_type: z.string(),
        manager_title_hint: z.string().optional(),
        target_ats_title: z.string()
    }),
    location: z.object({
        work_mode: z.enum(['remote', 'hybrid', 'onsite', 'unknown']),
        geo_requirement: z.string(),
        onsite_days: z.number(),
        travel_percent: z.number().optional(),
        travel_profile: z.object({
            regional_max: z.number(),
            global_max: z.number(),
            travel_inference_basis: z.string(),
            travel_confidence: z.enum(['high', 'inferred', 'low'])
        }).optional(),
        excerpt: z.string()
    }),
    compensation: z.object({
        base_min: z.number().nullable().optional(),
        base_max: z.number().nullable().optional(),
        ote_min: z.number().nullable().optional(),
        ote_max: z.number().nullable().optional(),
        split: z.string().optional(),
        equity: z.boolean(),
        confidence: z.enum(['high', 'medium', 'low_missing']),
        excerpt_lines: z.array(z.string()),
        comp_excerpts: z.array(z.string()).optional(),
        missing_fields: z.array(z.string())
    }),
    ats_requirements: z.object({
        must_haves: z.array(z.string()),
        nice_to_haves: z.array(z.string()),
        tools_platforms: z.array(z.string()),
        domains: z.array(z.string()),
        keywords_to_mirror: z.array(z.string()),
        validated_skill_clusters: z.array(z.object({
            cluster: z.string(),
            terms: z.array(z.string())
        }))
    }),
    scope_signals: z.object({
        discovery_ownership: z.boolean(),
        demo_expectation: z.boolean(),
        enterprise_motion: z.boolean(),
        cross_functional: z.boolean(),
        revops_component: z.boolean()
    }),
    risk_flags: z.object({
        pure_ae: z.boolean(),
        demo_monkey_risk: z.boolean(),
        internal_it_support: z.boolean(),
        heavy_travel: z.boolean(),
        comp_below_floor: z.boolean()
    }),
    negotiation_levers: z.object({
        market_duration_days: z.number().optional(),
        comp_flexibility_signals: z.array(z.string()),
        urgency_flags: z.array(z.string())
    }).optional(),
    operator_affinity_score: z.boolean().optional(),
    raw_storage: z.object({
        gcs_uri: z.string(),
        content_hash: z.string(),
        stable_fingerprint: z.string().optional()
    }),
    versions: z.object({
        normalizer_version: z.string(),
        rubric_version: z.string(),
        prompt_version: z.string()
    }),
    timestamps: z.object({
        ingested_at: z.string(),
        updated_at: z.string()
    })
});
export const ScoringRunSchema = z.object({
    runId: z.string(),
    jobId: z.string(),
    tenantId: z.string(),
    inputHash: z.string(),
    status: z.enum(['RUNNING', 'SUCCESS', 'FAILED']),
    total_score: z.number().optional(),
    breakdown_per_category: z.object({
        salesEngineerFit: z.number(),
        compensation: z.number(),
        technicalDepth: z.number(),
        dealComplexity: z.number(),
        remote: z.number(),
        revenueScope: z.number(),
        industry: z.number()
    }).optional(),
    evidence_from_jd: z.array(z.string()).optional(),
    evidence_from_facts: z.array(z.string()).optional(),
    unknown_fields: z.array(z.string()).optional(),
    risks: z.array(z.string()).optional(),
    keywords_to_mirror: z.array(z.string()).optional(),
    generatedAt: z.string()
});
export const PromptRunLogSchema = z.object({
    logId: z.string(),
    runId: z.string(),
    tenantId: z.string(),
    timestamp: z.string(),
    model: z.string(),
    promptType: z.string(),
    requestPayload: z.any(),
    responsePayload: z.any(),
    error: z.string().optional(),
    schemaViolation: z.boolean().default(false),
    cache_id: z.string().optional(),
    cache_hit: z.boolean().default(false),
    input_tokens: z.number().optional(),
    output_tokens: z.number().optional(),
    latency_ms: z.number().optional(),
    cost_estimate: z.number().optional(),
    prompt_version: z.string().optional(),
    schema_version: z.string().optional()
});
export const ApplicationSchema = z.object({
    applicationId: z.string(),
    jobId: z.string(),
    tenantId: z.string(),
    status: z.enum(['DRAFTED', 'SUBMITTED', 'REJECTED', 'INTERVIEWING', 'OFFER', 'CLOSED']),
    generation_logs: z.array(z.object({
        bullet_text: z.string(),
        source_fact_id: z.string(),
        jd_keyword_matched: z.string().optional(),
        cluster_name: z.string().optional()
    })),
    assets: z.object({
        resume_gcs_uri: z.string(),
        cover_letter_gcs_uri: z.string().optional()
    }),
    comms_sequence: z.array(z.object({
        day: z.number(),
        draft_id: z.string(),
        status: z.enum(['PENDING', 'SENT'])
    })),
    timestamps: z.object({
        created_at: z.string(),
        updated_at: z.string()
    })
});
//# sourceMappingURL=dataModel.js.map