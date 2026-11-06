import { z } from 'zod';

export const ProofPackSchema = z.object({
    artifact_id: z.string(),
    type: z.enum(['case_study', 'systems_diagram', '30_60_90', 'work_sample']),
    uri: z.string(),
    tags: z.array(z.string()),
    redaction_level: z.string(),
    allowed: z.boolean()
});

export type ProofPackEntry = z.infer<typeof ProofPackSchema>;
