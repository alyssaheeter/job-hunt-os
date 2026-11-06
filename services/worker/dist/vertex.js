import { VertexAI, SchemaType } from '@google-cloud/vertexai';
import { config } from './config.js';
import { AgentSukiPayloadSchema } from '@jhos/shared';
import { AGENT_SUKI_SYSTEM_PROMPT, generateSukiPrompt, JD_NORMALIZER_SYSTEM_PROMPT, generateNormalizerPrompt, EVALUATOR_SYSTEM_PROMPT, generateEvaluatorPrompt } from '@jhos/prompts';
import { EvaluatorResultSchema } from '@jhos/shared';
// Initialize Vertex with config
const vertex_ai = new VertexAI({ project: config.projectId, location: config.region });
// For now we map zod to the strict object schema Vertex expects.
// Because the JSON validation happens natively via zod on response,
// we provide a schema structure to give the model a hint or use responseSchema.
const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        summary: { type: SchemaType.STRING },
        independent_consultancy_bullets: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    fact_id: { type: SchemaType.STRING },
                    outcome_metric: { type: SchemaType.STRING },
                    mechanism: { type: SchemaType.STRING },
                    scope: { type: SchemaType.STRING },
                    tooling: { type: SchemaType.STRING },
                    role: { type: SchemaType.STRING },
                    tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    verified: { type: SchemaType.BOOLEAN }
                },
                required: ['fact_id', 'outcome_metric', 'mechanism', 'scope', 'tooling', 'role', 'verified', 'tags']
            }
        },
        ahead_bullets: { type: SchemaType.ARRAY }, // Simplified for vertex schema hint
        att_cse_bullets: { type: SchemaType.ARRAY },
        att_b2b_bullets: { type: SchemaType.ARRAY },
        skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        _chain_of_thought: { type: SchemaType.STRING }
    },
    required: [
        'summary',
        'independent_consultancy_bullets',
        'ahead_bullets',
        'att_cse_bullets',
        'att_b2b_bullets',
        'skills',
        '_chain_of_thought'
    ]
};
const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: config.geminiModel,
    generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.1
    },
    systemInstruction: AGENT_SUKI_SYSTEM_PROMPT
});
const normalizerModel = vertex_ai.preview.getGenerativeModel({
    model: config.geminiModel,
    generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
    },
    systemInstruction: JD_NORMALIZER_SYSTEM_PROMPT
});
const evaluatorModel = vertex_ai.preview.getGenerativeModel({
    model: config.geminiModel,
    generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
    },
    systemInstruction: EVALUATOR_SYSTEM_PROMPT
});
export async function invokeJDNormalizer(rawText) {
    const prompt = generateNormalizerPrompt(rawText);
    const req = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    try {
        const response = await normalizerModel.generateContent(req);
        const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text)
            throw new Error("No text returned by normalizer");
        return JSON.parse(text);
    }
    catch (err) {
        console.warn("Retrying normalizer schema mapping...", err);
        const req2 = { contents: [{ role: 'user', parts: [{ text: prompt + "\\n\\nThe previous attempt failed JSON validation. Ensure valid JSON output." }] }] };
        const response2 = await normalizerModel.generateContent(req2);
        const text2 = response2.response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text2)
            throw new Error("No text returned by normalizer on retry");
        return JSON.parse(text2);
    }
}
export async function invokeEvaluatorAgent(normalizedJobJson) {
    const prompt = generateEvaluatorPrompt(normalizedJobJson);
    const req = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    try {
        const response = await evaluatorModel.generateContent(req);
        const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text)
            throw new Error("No text returned by evaluator");
        const json = JSON.parse(text);
        return EvaluatorResultSchema.parse(json);
    }
    catch (err) {
        console.warn("Retrying evaluator schema mapping...", err);
        const req2 = { contents: [{ role: 'user', parts: [{ text: prompt + "\\n\\nThe previous attempt failed JSON validation. Ensure valid output." }] }] };
        const response2 = await evaluatorModel.generateContent(req2);
        const text2 = response2.response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text2)
            throw new Error("No text returned by evaluator on retry");
        return EvaluatorResultSchema.parse(JSON.parse(text2));
    }
}
/**
 * Invoke Agent Suki using optionally cached context for the Facts.
 */
export async function invokeAgentSuki(jdText, factsData) {
    // V2 Execution: In a fully productionized setup, we'd use vertex_ai.preview.cachedContents.create
    // For this build, we implement the structure required for the cache invocation by passing 
    // the canonical rules and facts together cleanly.
    let cacheHit = false;
    let inputTokens = 0;
    let tokenUsage = { input: 0, output: 0, latency_ms: 0 };
    const startTime = Date.now();
    const prompt = generateSukiPrompt(jdText, JSON.stringify(factsData));
    // First Attempt
    try {
        const { result, tokens } = await callModel(prompt);
        tokenUsage = { ...tokens, latency_ms: Date.now() - startTime };
        const parsed = AgentSukiPayloadSchema.parse(result);
        return { payload: parsed, tokens: tokenUsage };
    }
    catch (err) {
        console.warn("First LLM attempt failed schema validation. Retrying...", err);
        const retryStartTime = Date.now();
        // Second Attempt
        const { result, tokens } = await callModel(prompt + "\\n\\nThe previous attempt failed JSON validation. Ensure valid JSON matching the schema.");
        tokenUsage.input += tokens.input;
        tokenUsage.output += tokens.output;
        tokenUsage.latency_ms += (Date.now() - retryStartTime);
        const parsed = AgentSukiPayloadSchema.parse(result); // Hard fail if second attempt breaks
        return { payload: parsed, tokens: tokenUsage };
    }
}
async function callModel(prompt) {
    const req = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
    };
    const response = await generativeModel.generateContent(req);
    const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text;
    const metadata = response.response.usageMetadata;
    if (!text) {
        throw new Error("No text returned by Gemini");
    }
    return {
        result: JSON.parse(text),
        tokens: {
            input: metadata?.promptTokenCount || 0,
            output: metadata?.candidatesTokenCount || 0
        }
    };
}
//# sourceMappingURL=vertex.js.map