// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiConfig = {
    baseUrl: API_URL,
    endpoints: {
        news: `${API_URL}/api/news`,
        newsById: (id: string) => `${API_URL}/api/news/${id}`,
        quizDaily: `${API_URL}/api/quiz/daily`,
        quizSubmit: `${API_URL}/api/quiz/submit`,
    },
};
