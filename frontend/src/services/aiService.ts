import { SolveResult } from '../types';

const API_URL = '/api/ai';

export const solveWithAI = async (
    problem: string,
    subject: string,
    level: string = 'Step by Step',
    language: string = 'English'
): Promise<SolveResult> => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ problem, subject, level, language }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to connect to AI backend');
        }

        const data: SolveResult = await response.json();
        return data;
    } catch (error: any) {
        console.error("AI Solver Error:", error);
        return {
            success: false,
            error: error.message || "Failed to generate solution. Ensure the backend server is running."
        };
    }
};
