// Use Next.js API routes when deployed on Vercel, or external API URL for local development
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.NEXT_PUBLIC_API_BASE || 
  (typeof window !== "undefined" ? "" : "http://localhost:8000"); // Empty string means use same origin (Next.js API routes)

/**
 * Make an API request with optional authentication
 * @param endpoint - API endpoint (e.g., "/quiz/daily")
 * @param options - Fetch options
 * @param token - Optional authentication token (from Clerk)
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<Response> {
  // If API_BASE is empty, use Next.js API routes (same origin)
  const baseUrl = API_BASE || "";
  const url = baseUrl ? `${baseUrl}${endpoint}` : `/api${endpoint}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add authentication token if provided
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Fetch daily quiz questions
 * @param token - Optional Clerk authentication token
 */
export async function fetchDailyQuiz(token?: string | null) {
  const res = await apiRequest("/quiz/daily", {
    cache: "no-store", // always fetch fresh quiz
  }, token);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to fetch quiz" }));
    throw new Error(error.detail || "Failed to fetch quiz");
  }

  return res.json();
}

/**
 * Health check endpoint
 */
export async function healthCheck() {
  const res = await apiRequest("/health");
  return res.json();
}
