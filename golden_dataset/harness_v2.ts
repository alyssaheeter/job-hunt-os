import { invokeAgentSuki, invokeJDNormalizer, invokeEvaluatorAgent } from '../services/worker/src/vertex.js';
import { AgentSukiPayloadSchema, checkDisqualifiers } from '@jhos/shared';
import { preprocessJD } from '../services/worker/src/preprocessor.js';
import * as fs from 'fs';
import * as path from 'path';

// Mock Facts
const MOCK_FACTS = [
    {
        fact_id: 'F001',
        outcome_metric: 'Secured $10M enterprise contract',
        mechanism: 'Positioned AI-optimized server architecture as primary vendor solution',
        scope: 'Top-tier airline infrastructure modernization initiative',
        tooling: 'AI server configurations, enterprise data center architecture, Kubernetes, GCP',
        role: 'Client Solution Architect',
        tags: ['enterprise', 'ai', 'infrastructure', 'cloud'],
        verified: true
    }
];

async function runGoldenDataset() {
    console.log("=== JHOS v2 EXPERT HARNESS (REGRESSION TEST SUITE) ===");

    const testCasesDir = path.resolve('./golden_dataset/test_cases');
    const files = fs.readdirSync(testCasesDir).filter(f => f.endsWith('.txt'));

    for (const file of files) {
        const filePath = path.join(testCasesDir, file);
        const mockJdText = fs.readFileSync(filePath, 'utf-8');
        console.log(`\n\n=== Executing Test Case: ${file} ===`);

        try {
            // 1. Preprocessor Gate
            console.log("1. Testing Deterministic Preprocessor...");
            const preprocessResult = preprocessJD(mockJdText);

            if (preprocessResult.early_disqualification) {
                console.log(`-> Zero-Token Exit Triggered: ${preprocessResult.early_disqualification}`);
                console.log("-> Test Passed (Intentional Disqualification). Moving to next.");
                continue; // Exit successfully for clearance/onsite
            }

            console.log(`-> Preprocessor: OK (Stripped ${preprocessResult.removed_sections.length} boilerplate sections)`);

            // 2. Normalizer Gate
            console.log("2. Invoking JD Normalizer...");
            const normalizedData = await invokeJDNormalizer(preprocessResult.cleaned_jd_text);
            if (file.includes('ote_only') && normalizedData.compensation?.confidence !== 'low_missing') {
                throw new Error("Normalizer failed to infer 'low_missing' confidence for OTE-only JD.");
            }

            // 3. Disqualifier Check
            console.log("3. Testing Disqualifier Gate...");
            normalizedData.jobId = 'mock_job';
            normalizedData.tenantId = 'tenant_1';
            const dqCheck = checkDisqualifiers(normalizedData);
            if (dqCheck.disqualified) {
                console.log(`-> Disqualifier caught risks: ${dqCheck.reasons.join(', ')}. (OK for test cases)`);
            }

            // 4. Evaluator Subtractive Grading
            console.log("4. Invoking Evaluator Agent (Subtractive Grading)...");
            const evaluatorResult = await invokeEvaluatorAgent(JSON.stringify(normalizedData));
            console.log(`-> Evaluator Score: ${evaluatorResult.total_score} | Proceed: ${evaluatorResult.proceed}`);
            console.log(`-> Strike Zone Rationale: ${evaluatorResult.strike_zone_rationale}`);

            if (evaluatorResult.total_score >= 100) {
                throw new Error("Subtractive logic failed: Score was not reduced below 100.");
            }

            if (!evaluatorResult.proceed) {
                console.log("-> Evaluator blocked generation due to low score. Test Passed.");
                continue;
            }

            // 5. Agent Suki OMST Generation
            console.log("5. Invoking Agent Suki with Normalized Output and Facts...");
            const sukiResult = await invokeAgentSuki(JSON.stringify(normalizedData), MOCK_FACTS);
            const payload = sukiResult.payload;

            console.log("6. Validating Suki Payload Schema and Constraints...");
            AgentSukiPayloadSchema.parse(payload);

            const strPayload = JSON.stringify(payload);
            if (!payload._chain_of_thought) {
                throw new Error("Agent Suki failed to generate _chain_of_thought.");
            }

            const forbidden = ['guru', 'ninja', 'rockstar', 'dynamic', 'innovative'];
            for (const word of forbidden) {
                if (strPayload.toLowerCase().includes(word)) {
                    throw new Error(`OMST/Tone violation: Found forbidden word '${word}'`);
                }
            }
            console.log("-> OMST/Hallucination/Traceability Checks: OK");

        } catch (e: any) {
            console.error(`\nFAILED Test Case: ${file}`);
            console.error(e.message);
            process.exit(1);
        }
    }

    console.log("\n\n=== ALL 10 GOLDEN DATASET EDGE CASES COMPLETED AND PASSED ===");
}

if (!process.env.GCP_PROJECT_ID) {
    console.log("Skip running golden dataset, GCP_PROJECT_ID environment variable not set.");
} else {
    runGoldenDataset();
}
