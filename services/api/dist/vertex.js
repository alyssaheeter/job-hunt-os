import { VertexAI } from '@google-cloud/vertexai';
import { COMMS_AGENT_SYSTEM_PROMPT, generateCommsPrompt } from '@jhos/prompts';
// Using process.env natively for the lightweight API
const projectId = process.env.PROJECT_ID || 'default_project';
const region = process.env.REGION || 'us-central1';
const geminiModel = process.env.VERTEX_MODEL || 'gemini-1.5-pro';
const vertex_ai = new VertexAI({ project: projectId, location: region });
const commsModel = vertex_ai.preview.getGenerativeModel({
    model: geminiModel,
    generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
    },
    systemInstruction: COMMS_AGENT_SYSTEM_PROMPT
});
export async function invokeCommsAgent(jobContext, proofPackRecommended) {
    const prompt = generateCommsPrompt(jobContext, proofPackRecommended);
    const req = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    try {
        const response = await commsModel.generateContent(req);
        const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text)
            throw new Error("No text returned by Comms Agent");
        return JSON.parse(text);
    }
    catch (err) {
        console.error("Failed Comms Agent generation", err);
        throw err;
    }
}
//# sourceMappingURL=vertex.js.map