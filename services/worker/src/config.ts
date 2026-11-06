import dotenv from 'dotenv';
dotenv.config();

export const config = {
    projectId: process.env.GCP_PROJECT_ID || '',
    region: process.env.GCP_REGION || 'us-central1',
    storageBucket: process.env.STORAGE_BUCKET || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
};
