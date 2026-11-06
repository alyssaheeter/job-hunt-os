import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { ingestJD } from './ingestion.js';
import { invokeAgentSuki, invokeJDNormalizer, invokeEvaluatorAgent } from './vertex.js';
import { renderResume } from '@jhos/docx';
import { config } from './config.js';
import { checkDisqualifiers, ScoringRunSchema, PromptRunLogSchema, JobSchema } from '@jhos/shared';
import { preprocessJD } from './preprocessor.js';
// Node core
import crypto from 'crypto';

const db = new Firestore({ projectId: config.projectId });
const storage = new Storage({ projectId: config.projectId });

// Cloud Run Jobs accept ARGS or ENV vars. 
// For this workflow, let's assume tenantId and jobId are passed via ENV or derived from Pub/Sub payload.
async function main() {
  console.log("Starting JHOS Worker Job...");

  const tenantId = process.env.TENANT_ID || 'default_tenant';
  const jobId = process.env.JOB_ID;

  if (!jobId) {
    console.error("Missing JOB_ID environment variable");
    process.exit(1);
  }

  const runId = `run_${Date.now()}`;
  console.log(`Run ID: ${runId} | Tenant: ${tenantId} | Job: ${jobId}`);

  try {
    // 1. PREPROCESS JD
    console.log("Preprocessing JD...");
    const jdText = await ingestJD(tenantId, jobId);

    const preprocessResult = preprocessJD(jdText);
    if (preprocessResult.early_disqualification) {
      console.warn(`Zero-Token Exit: ${preprocessResult.early_disqualification}`);
      const runRef = db.collection('scoring_runs').doc(runId);
      await runRef.set({
        runId, jobId, tenantId, status: 'FAILED', risks: [preprocessResult.early_disqualification], generatedAt: new Date().toISOString()
      });
      // V3 Explicit State Update
      await db.collection('jobs').doc(jobId).set({ jobId, tenantId, status: 'DISQUALIFIED', timestamps: { ingested_at: new Date().toISOString(), updated_at: new Date().toISOString() } });
      process.exit(0);
    }

    // 2. NORMALIZE JD
    console.log("Normalizing JD...");
    let rawJobData = await invokeJDNormalizer(preprocessResult.cleaned_jd_text);

    // 3. IDEMPOTENCY FINGERPRINT V3
    // Structural Hash to prevent duplicate runs on whitespace or formatting changes from recruiter
    const hashParts = [
      rawJobData.role?.title?.toLowerCase().trim(),
      rawJobData.company?.name?.toLowerCase().trim() || 'unknown_co',
      rawJobData.location?.work_mode || 'unknown_mode',
      rawJobData.compensation?.base_max?.toString() || 'null_base',
      jdText.substring(0, 50)
    ];
    const inputHash = crypto.createHash('sha256').update(hashParts.join('|')).digest('hex');

    // Initialize run record
    const runRef = db.collection('scoring_runs').doc(runId);
    await runRef.set({
      runId,
      jobId,
      tenantId,
      inputHash,
      status: 'RUNNING',
      generatedAt: new Date().toISOString()
    });

    // Validate JobSchema
    const validatedJob = JobSchema.parse({
      ...rawJobData,
      jobId,
      tenantId,
      status: 'NORMALIZED',
      raw_storage: { gcs_uri: `gs://${config.storageBucket}/jd/${tenantId}/${jobId}/raw.txt`, content_hash: inputHash, stable_fingerprint: inputHash },
      versions: { normalizer_version: '3.0.0', rubric_version: '3.0.0', prompt_version: '3.0.0' },
      timestamps: { ingested_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    });

    await db.collection('jobs').doc(jobId).set(validatedJob);

    // 4. DISQUALIFIER GATE
    const dqCheck = checkDisqualifiers(validatedJob);
    if (dqCheck.disqualified) {
      console.log(`Disqualified due to: ${dqCheck.reasons.join(', ')}`);
      await runRef.update({ status: 'FAILED', risks: dqCheck.reasons });
      await db.collection('jobs').doc(jobId).update({ status: 'DISQUALIFIED' });
      process.exit(0);
    }

    // 5. EVALUATOR AGENT (V2 Pipeline Split)
    // Runs the subtractive grading rubric natively in the LLM. 
    console.log("Invoking Evaluator Agent...");
    const evaluatorResult = await invokeEvaluatorAgent(JSON.stringify(validatedJob));

    console.log(`Evaluator Score: ${evaluatorResult.total_score} | Proceed: ${evaluatorResult.proceed}`);
    console.log(`Strike Zone: ${evaluatorResult.strike_zone_rationale}`);

    await runRef.update({
      total_score: evaluatorResult.total_score,
      status: evaluatorResult.proceed ? 'RUNNING' : 'FAILED',
      breakdown_per_category: evaluatorResult.deductions,
      strike_zone_rationale: evaluatorResult.strike_zone_rationale,
      recruiter_questions: evaluatorResult.recruiter_questions
    });

    // Explicit V3 State Update
    await db.collection('jobs').doc(jobId).update({
      status: evaluatorResult.proceed ? 'APPROVED' : 'REJECTED'
    });

    if (!evaluatorResult.proceed) {
      console.log("Evaluator Agent rejected candidate FitScore. Halting pipeline to save execution tokens.");
      process.exit(0);
    }

    // 6. FETCH FACTS SEED (Subject to Vertex Caching logic)
    console.log("Fetching Canonical Profile/Facts...");
    const profileRef = await db.collection('canonical_profile').doc(tenantId).get();
    const factsList = profileRef.exists ? profileRef.data()?.facts || [] : [];

    if (factsList.length === 0) {
      console.warn("No facts found for candidate. Proceeding with empty facts framework.");
    }

    // 7. GENERATE AGENT SUKI PAYLOAD
    console.log("Invoking Agent Suki Generator...");
    const startTime = Date.now();
    let payload: any;
    let tokens: any;
    let schemaViolation = false;
    let errorMsg = null;

    try {
      const sukiResult = await invokeAgentSuki(preprocessResult.cleaned_jd_text, factsList);
      payload = sukiResult.payload;
      tokens = sukiResult.tokens;
    } catch (err: any) {
      schemaViolation = true;
      errorMsg = err.message;
      throw err; // Escalate failure
    } finally {
      // Always log the prompt run (V3 Observability standard)
      const logRef = db.collection('prompt_run_logs').doc(`log_${Date.now()}`);
      await logRef.set({
        logId: logRef.id,
        runId,
        tenantId,
        timestamp: new Date().toISOString(),
        model: config.geminiModel,
        promptType: 'AgentSuki',
        requestPayload: preprocessResult.cleaned_jd_text.substring(0, 100) + '...',
        responsePayload: payload || null,
        error: errorMsg,
        schemaViolation,
        input_tokens: tokens?.input || 0,
        output_tokens: tokens?.output || 0,
        latency_ms: tokens?.latency_ms || 0,
        prompt_version: '3.0.0',
        schema_version: '3.0.0'
      });
      console.log(`Agent Suki invocation took ${Date.now() - startTime}ms`);

      // V3 Drift Analytics
      if (payload) {
        const strPayload = JSON.stringify(payload);
        const fillInCount = (strPayload.match(/\[FILL-IN-GAP: /g) || []).length;
        const fill_in_rate = fillInCount / 15; // standard 15 bullets generated

        await db.collection('system_metrics').doc(`drift_${Date.now()}`).set({
          runId,
          tenantId,
          timestamp: new Date().toISOString(),
          fill_in_rate,
          fill_in_count: fillInCount,
          drift_alert: fill_in_rate > 0.25
        });
      }

      if (!errorMsg) {
        await db.collection('jobs').doc(jobId).update({ status: 'GENERATED' });
      }
    }

    // 8. DOCX RENDERING
    console.log("Generating Resume Resume...");
    const bucket = storage.bucket(config.storageBucket);
    // Download Template
    const templatePath = 'templates/resume/Template Resume (1).docx';

    // NOTE: If template isn't in GCS, load it from local path:
    // We were instructed to keep: /templates/resume/Template Resume (1).docx
    // Let's read from local disk if it's there.
    const fs = await import('fs/promises');
    const path = await import('path');

    let templateBuf: Buffer;
    try {
      const localTemplatePath = path.resolve('../..', 'templates/resume/Template Resume (1).docx');
      templateBuf = await fs.readFile(localTemplatePath);
    } catch (e) {
      // Fallback to GCS
      console.log("Local template not found, falling back to GCS...");
      const tplFile = bucket.file(templatePath);
      const [tContent] = await tplFile.download();
      templateBuf = tContent;
    }

    const outputBuf = renderResume(templateBuf, payload);

    // Validate no `{{` remains
    const renderedText = outputBuf.toString('utf-8');
    if (renderedText.includes('{{')) {
      const errorMsg = "DOCX verification failed: Unresolved placeholders ('{{') found in the generated resume.";
      console.error(errorMsg);
      await runRef.update({ status: 'FAILED', error: errorMsg });
      process.exit(1);
    }

    // 6. UPLOAD RENDERED RESUME
    const applicationId = `app_${Date.now()}`;
    const destPath = `materials/${tenantId}/${applicationId}/resume.docx`;
    console.log(`Uploading generated resume to ${destPath}...`);
    const outputFile = bucket.file(destPath);
    await outputFile.save(outputBuf, { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    // Update run as success
    await runRef.update({
      status: 'SUCCESS',
      total_score: evaluatorResult.total_score
    });

    // V3 DRAFTED State (Assuming Comms sequence would trigger here)
    await db.collection('jobs').doc(jobId).update({ status: 'RENDERED' });

    console.log("Worker execution completed successfully.");
    process.exit(0);

  } catch (err: any) {
    console.error("Worker Execution Failed:", err);
    // Mark run as failed
    try {
      await db.collection('scoring_runs').doc(runId).update({ status: 'FAILED' });
    } catch (e) { }
    process.exit(1);
  }
}

main();
