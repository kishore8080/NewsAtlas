"use client";

import { useEffect, useState } from "react";

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

  // Fetch quiz data
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/quiz/daily`)
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data);

        // Handle both cases: array or wrapped in {quiz: []}
        if (Array.isArray(data)) {
          setQuiz(data);
        } else if (data.quiz && Array.isArray(data.quiz)) {
          setQuiz(data.quiz);
        } else {
          console.error("Unexpected API response format");
          setQuiz([]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // --- NEW: reset currentQ when quiz changes to avoid out-of-range index
  useEffect(() => {
    setCurrentQ(0);
  }, [quiz]);

  // --- NEW: normalize option letter (extract first letter robustly)
  const extractLetter = (opt: string) =>
    (opt || "").toString().trim().charAt(0).toUpperCase();

  // --- UPDATED: handleSelect now accepts full option string and stores the normalized letter
  const handleSelect = (qIndex: number, opt: string) => {
    const letter = extractLetter(opt);
    setAnswers((prev) => ({ ...prev, [qIndex]: letter }));
  };

  // --- NEW: normalize correct answer (handles "B", "B)", "B )", etc.)
  const getCorrectLetter = (q: Question) =>
    (q?.answer || "").toString().trim().charAt(0).toUpperCase();

  // --- UPDATED: use getCorrectLetter in scoring
  const score = Array.isArray(quiz)
    ? quiz.reduce((acc, q, idx) => {
        const correct = getCorrectLetter(q);
        return acc + (answers[idx] === correct ? 1 : 0);
      }, 0)
    : 0;

  if (loading) {
    return <p className="p-6">Loading quiz...</p>;
  }

  if (quiz.length === 0) {
    return <p className="p-6 text-red-600">No quiz available.</p>;
  }

  // guard q - in case currentQ is out of bounds
  const q = quiz[currentQ];
  if (!q) return <p className="p-6 text-red-600">Invalid question index.</p>;

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center py-10">
      <h1 className="text-2xl font-bold text-black mb-6">Daily Event Quiz!!</h1>

      <div className="mb-6 p-4 border rounded-lg w-full max-w-2xl bg-white">
      {/* Show only the base question text */}
<p className="font-bold text-black text-lg mb-2">
  {currentQ + 1}. {q.question.replace(/(\d\..*)/, "").trim()}
</p>

{/* Show statements cleanly, one per line */}
{q.statements && q.statements.length > 0 && (
  <div className="mb-4 text-black">
    {q.statements.map((stmt, i) => (
      <p key={i} className="mb-1">
         {stmt}
      </p>
    ))}
  </div>
)}
        <ul>
          {q.options.map((opt, i) => {
            const letter = extractLetter(opt); // normalized letter for this option
            const selected = answers[currentQ] === letter;
            return (
              <li key={i}>
                <button
                  onClick={() => handleSelect(currentQ, opt)} // pass full opt
                  className={`block w-full text-left p-2 rounded-md border mb-1 font-semibold ${
                    selected
                      ? "bg-blue-200 text-black border-black"
                      : "bg-white text-black border-black hover:bg-gray-100"
                  }`}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>

        {submitted && (
          <p
            className={`mt-2 ${
              answers[currentQ] === getCorrectLetter(q)
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            Correct answer: {getCorrectLetter(q)}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between w-full max-w-2xl">
        {currentQ > 0 && !submitted && (
          <button
            onClick={() => setCurrentQ((s) => Math.max(0, s - 1))}
            className="bg-gray-400 text-white px-4 py-2 rounded-md"
          >
            Previous
          </button>
        )}

        {!submitted && currentQ < quiz.length - 1 && (
          <button
            onClick={() => setCurrentQ((s) => Math.min(quiz.length - 1, s + 1))}
            className="bg-blue-600 text-white px-4 py-2 rounded-md ml-auto"
            disabled={!answers[currentQ]}
          >
            Next
          </button>
        )}

        {!submitted && currentQ === quiz.length - 1 && (
          <button
            onClick={() => setSubmitted(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md ml-auto"
            disabled={!answers[currentQ]}
          >
            Submit Quiz
          </button>
        )}
      </div>

      {/* Show score only after submission */}
      {submitted && (
        <p className="text-xl text-black font-bold mt-6">
           You scored {score} / {quiz.length}
        </p>
      )}
    </div>
  );
}
