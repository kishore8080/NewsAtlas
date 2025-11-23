export type QuizResult = {
  id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  date: string; // ISO string
  timeSpentSeconds: number;
};

export type DashboardStats = {
  totalQuizzes: number;
  averageScore: number;
  studyStreak: number;
  totalHours: number;
  recentActivity: QuizResult[];
};

const STORAGE_KEY = "eazyprep_quiz_results";

export const saveQuizResult = (result: Omit<QuizResult, "id" | "date">) => {
  if (typeof window === "undefined") return;

  const newResult: QuizResult = {
    ...result,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };

  const existing = getQuizResults();
  const updated = [newResult, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newResult;
};

export const getQuizResults = (): QuizResult[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getDashboardStats = (): DashboardStats => {
  const results = getQuizResults();

  const totalQuizzes = results.length;
  const totalScore = results.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0);
  const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;
  
  const totalSeconds = results.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);
  const totalHours = Math.round((totalSeconds / 3600) * 10); // 1 decimal place

  // Calculate Streak (consecutive days with at least one quiz)
  // This is a simplified streak calculation
  const uniqueDates = new Set(results.map(r => r.date.split('T')[0]));
  const studyStreak = uniqueDates.size; 

  return {
    totalQuizzes,
    averageScore,
    studyStreak,
    totalHours,
    recentActivity: results.slice(0, 5), // Last 5 activities
  };
};
