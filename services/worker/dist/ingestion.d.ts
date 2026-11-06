/**
 * Reads a raw Job Description from Cloud Storage.
 * Path: gs://[BUCKET]/jd/{tenantId}/{jobId}/raw.txt
 */
export declare function ingestJD(tenantId: string, jobId: string): Promise<string>;
