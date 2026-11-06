import { Storage } from '@google-cloud/storage';
import { config } from './config.js';
const storage = new Storage({ projectId: config.projectId });
/**
 * Reads a raw Job Description from Cloud Storage.
 * Path: gs://[BUCKET]/jd/{tenantId}/{jobId}/raw.txt
 */
export async function ingestJD(tenantId, jobId) {
    const bucket = storage.bucket(config.storageBucket);
    const file = bucket.file(`jd/${tenantId}/${jobId}/raw.txt`);
    const [exists] = await file.exists();
    if (!exists) {
        throw new Error(`Raw JD not found at jd/${tenantId}/${jobId}/raw.txt`);
    }
    const [contents] = await file.download();
    return contents.toString('utf-8');
}
//# sourceMappingURL=ingestion.js.map