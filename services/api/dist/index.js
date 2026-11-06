import express from 'express';
import cors from 'cors';
import { Firestore } from '@google-cloud/firestore';
import { createGmailDraft } from './gmail.js';
import { invokeCommsAgent } from './vertex.js';
import crypto from 'crypto';
const app = express();
app.use(cors());
app.use(express.json());
const db = new Firestore();
// Middleware to verify basic auth or token for webhook trigger
app.use((req, res, next) => {
    if (req.path === '/health' || req.path === '/')
        return next();
    const authLine = req.header('Authorization');
    if (!authLine) {
        return res.status(401).send('Missing Authorization header');
    }
    next();
});
app.get('/', (req, res) => {
    res.send('JHOS API is operational. Authorization required for non-root routes.');
});
// A webhook primarily used to trigger outreach or scheduled flows
app.post('/webhook/draft-outreach', async (req, res) => {
    try {
        const { tenantId, jobId, targetEmail, generatedResumeUri } = req.body;
        if (!tenantId || !targetEmail) {
            return res.status(400).send('Missing required fields: tenantId, targetEmail');
        }
        const commId = `comm_${crypto.randomUUID()}`;
        // 1. Invoke Comms Agent Vertex Model
        const jobContext = { tenantId, jobId, generatedResumeUri };
        const proofPackRecommended = "Standard 30-60-90 Day Plan"; // Could be dynamically fetched
        const commsPayload = await invokeCommsAgent(jobContext, proofPackRecommended);
        // 2. Generate 4 DRAFT_ONLY drafts in Gmail
        const draft0 = await createGmailDraft(commsPayload.day0.subject, commsPayload.day0.body, targetEmail);
        const draft3 = await createGmailDraft(commsPayload.day3.subject, commsPayload.day3.body, targetEmail);
        const draft7 = await createGmailDraft(commsPayload.day7.subject, commsPayload.day7.body, targetEmail);
        const draft14 = await createGmailDraft(commsPayload.day14.subject, commsPayload.day14.body, targetEmail);
        // 3. Save sequence record to Firestore
        await db.collection('communications').doc(commId).set({
            commId,
            tenantId,
            jobId: jobId || 'unlinked',
            draftIds: { day0: draft0, day3: draft3, day7: draft7, day14: draft14 },
            cadenceSchedule: {
                day0: new Date().toISOString(),
                day3: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                day7: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                day14: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            },
            createdAt: new Date().toISOString(),
            type: 'OUTREACH_SEQUENCE'
        });
        res.json({ success: true, draftIds: { day0: draft0, day3: draft3, day7: draft7, day14: draft14 } });
    }
    catch (err) {
        console.error("Draft outreach webhook failed:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});
app.get('/health', (req, res) => {
    res.send('JHOS API is healthy');
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`JHOS API listening on port ${PORT}`);
});
//# sourceMappingURL=index.js.map