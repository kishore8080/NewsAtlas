"use client";

import { useEffect, useState } from "react";
import { fetchDailyQuiz } from "@/lib/api";
import { saveQuizResult } from "@/lib/storage";
import Link from "next/link";
import Button from "@/components/ui/Button";

type Question = {
  question: string;
  statements: string[];
  options: string[];
  answer: string;
};

export default function DailyQuiz() {
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await fetchDailyQuiz();
        if (Array.isArray(data)) {
          setQuiz(data);
        } else if (data.quiz && Array.isArray(data.quiz)) {
          setQuiz(data.quiz);
        } else {
          setQuiz([]);
        }
        setStartTime(Date.now());
      } catch (error) {
        console.error("Failed to load quiz:", error);
        setQuiz([]);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, []);

  useEffect(() => {
    setCurrentQ(0);
  }, [quiz]);

  const extractLetter = (opt: string) =>
    (opt || "").toString().trim().charAt(0).toUpperCase();

  const handleSelect = (qIndex: number, opt: string) => {
    if (submitted) return;
    const letter = extractLetter(opt);
    setAnswers((prev) => ({ ...prev, [qIndex]: letter }));
  };

  const getCorrectLetter = (q: Question) =>
    (q?.answer || "").toString().trim().charAt(0).toUpperCase();

  const calculateScore = () => {
    return Array.isArray(quiz)
      ? quiz.reduce((acc, q, idx) => {
        const correct = getCorrectLetter(q);
        return acc + (answers[idx] === correct ? 1 : 0);
      }, 0)
      : 0;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);

    saveQuizResult({
      topic: "Daily Quiz", // In real app, get from API
      score: score,
      totalQuestions: quiz.length,
      timeSpentSeconds: timeSpentSeconds,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (quiz.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Quiz Available</h2>
          <p className="text-gray-600 mb-6">Check back later for today&apos;s questions.</p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const q = quiz[currentQ];
  const progress = ((currentQ + 1) / quiz.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Quiz</h1>
            <p className="text-sm text-gray-500">Test your knowledge</p>
          </div>
          {!submitted && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                Question {currentQ + 1} <span className="text-gray-400">/ {quiz.length}</span>
              </p>
            </div>
          )}
        </div>

        {submitted ? (
          // Results View
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-600 p-8 text-center text-white">
              <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-blue-100 mb-6">Here is how you performed</p>

              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white text-blue-600 text-3xl font-bold mb-4">
                {Math.round((calculateScore() / quiz.length) * 100)}%
              </div>

              <p className="text-lg">
                You scored <strong>{calculateScore()}</strong> out of <strong>{quiz.length}</strong>
              </p>
            </div>

            <div className="p-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button className="w-full justify-center">Go to Dashboard</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto justify-center"
                >
                  Retake Quiz
                </Button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Review</h3>
              <div className="space-y-6">
                {quiz.map((q, idx) => {
                  const correct = getCorrectLetter(q);
                  const chosen = answers[idx];
                  const isCorrect = chosen === correct;

                  return (
                    <div key={idx} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className="flex gap-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">{q.question.replace(/(\d\..*)/, "").trim()}</p>
                          <div className="text-sm space-y-1">
                            <p className={isCorrect ? "text-green-700" : "text-red-700"}>
                              Your answer: <span className="font-semibold">{chosen || "Skipped"}</span>
                            </p>
                            {!isCorrect && (
                              <p className="text-green-700">
                                Correct answer: <span className="font-semibold">{correct}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          // Quiz View
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
                {q.question.replace(/(\d\..*)/, "").trim()}
              </h2>

              {q.statements && q.statements.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2 border border-gray-100">
                  {q.statements.map((stmt, i) => (
                    <p key={i} className="text-gray-700 text-sm leading-relaxed">{stmt}</p>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  const letter = extractLetter(opt);
                  const isSelected = answers[currentQ] === letter;

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(currentQ, opt)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group ${isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-700"
                        }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                        }`}>
                        {letter}
                      </span>
                      <span className="font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQ((s) => Math.max(0, s - 1))}
                disabled={currentQ === 0}
                className={currentQ === 0 ? "invisible" : ""}
              >
                Previous
              </Button>

              {currentQ < quiz.length - 1 ? (
                <Button
                  onClick={() => setCurrentQ((s) => Math.min(quiz.length - 1, s + 1))}
                  disabled={!answers[currentQ]}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!answers[currentQ]}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
