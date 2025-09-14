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

  const handleSelect = (qIndex: number, option: string) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  const score = Array.isArray(quiz)
    ? quiz.reduce(
        (acc, q, idx) => acc + (answers[idx] === q.answer ? 1 : 0),
        0
      )
    : 0;

  if (loading) {
    return <p className="p-6">Loading quiz...</p>;
  }

  if (quiz.length === 0) {
    return <p className="p-6 text-red-600">No quiz available.</p>;
  }

  return (
     <div className="min-h-screen bg-blue-100 flex flex-col items-center py-10">
      <h1 className="text-2xl font-bold text-black mb-6">Daily UPSC Quiz!!</h1>

      {quiz.map((q, idx) => (
        <div key={idx} className="mb-6 p-4 border rounded-lg">
          <p className="font-bold text-black text-lg">
            {idx + 1}. {q.question}
          </p>

          <ul>
            {q.options.map((opt, i) => (
              <li key={i}>
                <button
                  onClick={() => handleSelect(idx, opt[0])}
                  className={`block w-full text-left p-2 rounded-md border mb-1 ${
                    answers[idx] === opt[0]
                      ? "bg-blue-500 text-black"
                      : "bg-black"
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>

          {submitted && (
            <p
              className={`mt-2 ${
                answers[idx] === q.answer ? "text-green-600" : "text-red-600"
              }`}
            >
              Correct answer: {q.answer}
            </p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Submit Quiz
        </button>
      ) : (
        <p className="text-xl font-bold mt-4">
          ✅ You scored {score} / {quiz.length}
        </p>
      )}
    </div>
  );
}
