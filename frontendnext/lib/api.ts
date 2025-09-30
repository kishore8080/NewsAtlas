const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export async function fetchDailyQuiz() {
    const res = await fetch("http://127.0.0.1:8000/quiz/daily", {
      cache: "no-store", // always fetch fresh quiz
    });
    if (!res.ok) throw new Error("Failed to fetch quiz");
    return res.json();
  }
  