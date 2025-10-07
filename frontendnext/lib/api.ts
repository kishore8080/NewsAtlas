const API_BASE =
  process.env.NEXT_PUBLIC_API_URL;

export async function fetchDailyQuiz() {
  const res = await fetch(`${API_BASE}/quiz/daily`, {
    cache: "no-store", // always fetch fresh quiz
  });

  if (!res.ok) throw new Error("Failed to fetch quiz");

  return res.json();
}

