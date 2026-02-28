import axios from 'axios';

const API_BASE_URL = '/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

export const solveEquation = async (equation: string, solveFor?: string, knownVariables?: Record<string, string>, explanationLevel?: string) => {
    const response = await api.post('/solve', {
        equation,
        solve_for: solveFor,
        known_variables: knownVariables,
        explanation_level: explanationLevel
    });
    return response.data;
};

export const plotEquation = async (equation: string) => {
    const response = await api.post('/plot', { equation });
    return response.data;
};

export const getFormulas = async () => {
    const response = await api.get('/formulas');
    return response.data;
};

export const searchFormulas = async (query: string) => {
    const response = await api.get(`/formulas/search?q=${query}`);
    return response.data;
};

import { createWorker } from 'tesseract.js';

export const scanImage = async (file: File) => {
    try {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(file);
        await worker.terminate();

        const text = ret.data.text;

        // Simple extraction logic for questions (similar to backend)
        const questions = text.split(/\n\s*\d+[\.\)]\s+|\n\s*Q(?:uestion)?\s*\.?\s*\d+\s*[\.\:\-]?\s*/).filter(q => q.trim().length > 5);

        return {
            success: true,
            text: text,
            questions: questions.length > 0 ? questions : [text.strip()],
            is_paper: questions.length > 1
        };
    } catch (error) {
        console.error("Local OCR Error:", error);
        return {
            success: false,
            error: "Failed to scan image locally: " + (error as Error).message
        };
    }
};

// Extension for strip since it might not be in the browser environment
if (!(String.prototype as any).strip) {
    (String.prototype as any).strip = function () {
        return this.trim();
    };
}
