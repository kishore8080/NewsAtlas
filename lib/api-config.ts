// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-service-523536539972.europe-west1.run.app';

export const apiConfig = {
    baseUrl: API_URL,
    endpoints: {
        news: `${API_URL}/api/news`,
        newsById: (id: string) => `${API_URL}/api/news/${id}`,
        quizDaily: `${API_URL}/api/quiz/daily`,
        quizSubmit: `${API_URL}/api/quiz/submit`,
        trackEvents: `${API_URL}/api/events/track`,
        unsubscribeEvents: `${API_URL}/api/events/unsubscribe`,
    },
}

export type EventTrackingPayload = {
    event: "track_global_events" | "start_tracking" | "stop_tracking"
    timestamp: string
    isTracking: boolean
    location?: string
}

export type EventTrackingResponse = {
    success: boolean
    trackingId: string
    message: string
}
