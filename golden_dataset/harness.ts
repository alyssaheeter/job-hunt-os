import { invokeAgentSuki, invokeJDNormalizer, invokeEvaluatorAgent } from '../services/worker/src/vertex.js';
import { AgentSukiPayloadSchema, checkDisqualifiers } from '@jhos/shared';
import { preprocessJD } from '../services/worker/src/preprocessor.js';

// Mock Data
const MOCK_JD = `
Senior Solutions Engineer - Enterprise AI
Equal Opportunity Employer. We offer great 401k and Dental/Vision benefits. 
We are looking for a highly technical presales engineer to lead enterprise data center modernization and AI initiatives.
Must have experience driving large deals (>$1M) and working cross-functionally.
Compensation: $250k OTE. (Base is commensurate with experience).
Requires weekly travel to customer sites.
Remote allowed.
`;

const MOCK_FACTS = [
  {
    fact_id: 'F001',
    outcome_metric: 'Secured $10M enterprise contract',
    mechanism: 'Positioned AI-optimized server architecture as primary vendor solution',
    scope: 'Top-tier airline infrastructure modernization initiative',
    tooling: 'AI server configurations, enterprise data center architecture',
    role: 'Client Solution Architect',
    tags: ['enterprise', 'ai', 'infrastructure'],
    verified: true
  }
];

async function runGoldenDataset() {
  console.log("=== JHOS v2 GOLDEN DATASET HARNESS ===");
  try {
    console.log("1. Testing Deterministic Preprocessor...");
    const preprocessResult = preprocessJD(MOCK_JD);
    if (!preprocessResult.removed_sections.some(s => s.toLowerCase().includes('401k'))) {
      throw new Error("Preprocessor failed to strip EEOC/Benefits boilerplate.");
    }
    console.log(`-> Preprocessor: OK (Stripped ${preprocessResult.removed_sections.length} sections)`);

    console.log("2. Invoking JD Normalizer...");
    const normalizedData = await invokeJDNormalizer(preprocessResult.cleaned_jd_text);

    if (normalizedData.compensation?.confidence !== 'low_missing') {
      console.warn("WARNING: Normalizer failed to set compensation confidence to 'low_missing' when only OTE was provided.");
    }

    console.log("3. Testing Disqualifier Gate...");
    // Inject required IDs for valid schema
    normalizedData.jobId = 'mock_job_1';
    normalizedData.tenantId = 'tenant_1';

    const dqCheck = checkDisqualifiers(normalizedData);
    if (dqCheck.disqualified) {
      console.warn(`Disqualifier caught risks: ${dqCheck.reasons.join(', ')}`);
      // We expect travel to potentially fail it depending on the inference mapping. 
      // For testing, we log it but proceed to Evaluator to test subtractive logic anyway.
    } else {
      console.log("-> Disqualifier: PASSED");
    }

    console.log("4. Invoking Evaluator Agent (Subtractive Grading)...");
    const evaluatorResult = await invokeEvaluatorAgent(JSON.stringify(normalizedData));
    console.log(`-> Evaluator Score: ${evaluatorResult.total_score} | Proceed: ${evaluatorResult.proceed}`);
    console.log(`-> Strike Zone Rationale: ${evaluatorResult.strike_zone_rationale}`);
    console.log(`-> Recruiter Questions:`, evaluatorResult.recruiter_questions);

    if (evaluatorResult.total_score >= 100) {
      throw new Error("Evaluator failed to subtract points representing true subtractive logic.");
    }

    console.log("5. Invoking Agent Suki with Normalized Output and Facts...");
    const { payload } = await invokeAgentSuki(JSON.stringify(normalizedData), MOCK_FACTS);

    console.log("6. Validating JSON Schema Adherence...");
    AgentSukiPayloadSchema.parse(payload);
    console.log("-> Schema: OK");

    console.log("7. Validating OMST Compliance, Fact Traceability & Hallucination Fallbacks...");
    const strPayload = JSON.stringify(payload);

    if (!payload._chain_of_thought) {
      throw new Error("Agent Suki failed to generate _chain_of_thought prior to payload generation.");
    }

    if (!strPayload.includes('[FILL-IN') && !strPayload.includes('F001')) {
      throw new Error("WARNING: OMST traceability missed mapping the fact_id (F001) or didn't generate missing data gaps.");
    }

    // Check forbidden adjectives from V1.1 / V2
    const forbidden = ['guru', 'ninja', 'rockstar', 'dynamic', 'innovative'];
    for (const word of forbidden) {
      if (strPayload.toLowerCase().includes(word)) {
        throw new Error(`OMST/Tone violation: Found forbidden word '${word}'`);
      }
    }
    console.log("-> OMST/Hallucination/Traceability Checks: OK");

    console.log("\n=== GOLDEN DATASET PASSED ===");
    console.log("Sample AI Payload Output:");
    console.log(JSON.stringify(payload, null, 2));

  } catch (err) {
    console.error("\\n=== GOLDEN DATASET FAILED ===");
    console.error(err);
    process.exit(1);
  }
}

// Check if credentials are set (it will try to use ADC if running locally)
if (!process.env.GCP_PROJECT_ID) {
  console.log("Skip running golden dataset, GCP_PROJECT_ID environment variable not set. (Requires default application credentials).");
} else {
  runGoldenDataset();
}
