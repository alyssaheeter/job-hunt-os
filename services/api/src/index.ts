import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { createGmailDraft } from './gmail.js';
import { invokeCommsAgent } from './vertex.js';
import crypto from 'crypto';

// ── Firebase Admin SDK ──────────────────────────────────────────
// Uses Application Default Credentials in Cloud Run,
// or GOOGLE_APPLICATION_CREDENTIALS env var locally.
admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// ── Auth Middleware ──────────────────────────────────────────────
// Verifies Firebase ID tokens for all non-root, non-health routes.
app.use(async (req, res, next) => {
  if (req.path === '/health' || req.path === '/') return next();

  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    (req as any).uid = decoded.uid;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// ── Root & Health ───────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send('JHOS API is operational. Authorization required for non-root routes.');
});

app.get('/health', (_req, res) => {
  res.send('JHOS API is healthy');
});

// ── Job Action Routes ───────────────────────────────────────────
// These routes drive the pipeline from the JobDetail UI buttons.

// Helper: update job status in Firestore
async function updateJobStatus(jobId: string, status: string, extras?: Record<string, any>) {
  const ref = db.collection('jobs').doc(jobId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error(`Job ${jobId} not found`);

  await ref.update({
    status,
    'timestamps.updated_at': new Date().toISOString(),
    ...extras,
  });

  return { id: jobId, status, ...(extras || {}) };
}

app.post('/api/jobs/:id/normalize', async (req, res) => {
  try {
    const result = await updateJobStatus(req.params.id, 'NORMALIZED');
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Normalize failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/jobs/:id/evaluate', async (req, res) => {
  try {
    const result = await updateJobStatus(req.params.id, 'EVALUATED');
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Evaluate failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/jobs/:id/approve', async (req, res) => {
  try {
    const result = await updateJobStatus(req.params.id, 'APPROVED');
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Approve failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/jobs/:id/reject', async (req, res) => {
  try {
    const result = await updateJobStatus(req.params.id, 'REJECTED');
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Reject failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/jobs/:id/generate', async (req, res) => {
  try {
    const result = await updateJobStatus(req.params.id, 'GENERATED');
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Generate failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/jobs/:id/render', async (req, res) => {
  try {
    const result = await updateJobStatus(req.params.id, 'RENDERED');
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Render failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/jobs/:id/drafts', async (req, res) => {
  try {
    const jobRef = db.collection('jobs').doc(req.params.id);
    const snap = await jobRef.get();
    if (!snap.exists) return res.status(404).json({ error: 'Job not found' });

    const jobData = snap.data()!;
    const tenantId = jobData.tenantId || 'default_tenant';
    const targetEmail = req.body.targetEmail || jobData.company?.recruiter_email;

    if (!targetEmail) {
      return res.status(400).json({ error: 'No target email available. Provide targetEmail in request body.' });
    }

    const commId = `comm_${crypto.randomUUID()}`;
    const jobContext = { tenantId, jobId: req.params.id, generatedResumeUri: jobData.raw_storage?.gcs_uri };
    const proofPackRecommended = 'Standard 30-60-90 Day Plan';
    const commsPayload = await invokeCommsAgent(jobContext, proofPackRecommended);

    const draft0 = await createGmailDraft(commsPayload.day0.subject, commsPayload.day0.body, targetEmail);
    const draft3 = await createGmailDraft(commsPayload.day3.subject, commsPayload.day3.body, targetEmail);
    const draft7 = await createGmailDraft(commsPayload.day7.subject, commsPayload.day7.body, targetEmail);
    const draft14 = await createGmailDraft(commsPayload.day14.subject, commsPayload.day14.body, targetEmail);

    await db.collection('communications').doc(commId).set({
      commId,
      tenantId,
      jobId: req.params.id,
      draftIds: { day0: draft0, day3: draft3, day7: draft7, day14: draft14 },
      cadenceSchedule: {
        day0: new Date().toISOString(),
        day3: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        day7: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        day14: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      createdAt: new Date().toISOString(),
      type: 'OUTREACH_SEQUENCE',
    });

    await jobRef.update({
      status: 'DRAFTED',
      'timestamps.updated_at': new Date().toISOString(),
    });

    res.json({ success: true, draftIds: { day0: draft0, day3: draft3, day7: draft7, day14: draft14 } });
  } catch (err: any) {
    console.error('Drafts creation failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Legacy Webhook (still supported) ────────────────────────────
app.post('/webhook/draft-outreach', async (req, res) => {
  try {
    const { tenantId, jobId, targetEmail, generatedResumeUri } = req.body;

    if (!tenantId || !targetEmail) {
      return res.status(400).send('Missing required fields: tenantId, targetEmail');
    }

    const commId = `comm_${crypto.randomUUID()}`;

    const jobContext = { tenantId, jobId, generatedResumeUri };
    const proofPackRecommended = 'Standard 30-60-90 Day Plan';
    const commsPayload = await invokeCommsAgent(jobContext, proofPackRecommended);

    const draft0 = await createGmailDraft(commsPayload.day0.subject, commsPayload.day0.body, targetEmail);
    const draft3 = await createGmailDraft(commsPayload.day3.subject, commsPayload.day3.body, targetEmail);
    const draft7 = await createGmailDraft(commsPayload.day7.subject, commsPayload.day7.body, targetEmail);
    const draft14 = await createGmailDraft(commsPayload.day14.subject, commsPayload.day14.body, targetEmail);

    await db.collection('communications').doc(commId).set({
      commId,
      tenantId,
      jobId: jobId || 'unlinked',
      draftIds: { day0: draft0, day3: draft3, day7: draft7, day14: draft14 },
      cadenceSchedule: {
        day0: new Date().toISOString(),
        day3: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        day7: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        day14: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      createdAt: new Date().toISOString(),
      type: 'OUTREACH_SEQUENCE',
    });

    res.json({ success: true, draftIds: { day0: draft0, day3: draft3, day7: draft7, day14: draft14 } });
  } catch (err: any) {
    console.error('Draft outreach webhook failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Server Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`JHOS API listening on port ${PORT}`);
});
