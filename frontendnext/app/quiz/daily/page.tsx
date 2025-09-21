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

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/quiz/daily`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQuiz(data);
        } else if (data.quiz && Array.isArray(data.quiz)) {
          setQuiz(data.quiz);
        } else {
          setQuiz([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentQ(0);
  }, [quiz]);

  const extractLetter = (opt: string) =>
    (opt || "").toString().trim().charAt(0).toUpperCase();

  const handleSelect = (qIndex: number, opt: string) => {
    const letter = extractLetter(opt);
    setAnswers((prev) => ({ ...prev, [qIndex]: letter }));
  };

  const getCorrectLetter = (q: Question) =>
    (q?.answer || "").toString().trim().charAt(0).toUpperCase();

  const score = Array.isArray(quiz)
    ? quiz.reduce((acc, q, idx) => {
        const correct = getCorrectLetter(q);
        return acc + (answers[idx] === correct ? 1 : 0);
      }, 0)
    : 0;

  if (loading) return <p className="p-6">Loading quiz...</p>;
  if (quiz.length === 0) return <p className="p-6 text-red-600">No quiz available.</p>;

  const q = quiz[currentQ];
  if (!q) return <p className="p-6 text-red-600">Invalid question index.</p>;

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center py-10">
      <h1 className="text-2xl font-bold text-black mb-6">Daily Event Quiz!!</h1>

      {/* If submitted -> Review Mode */}
      {submitted ? (
        <div className="w-full max-w-3xl">
          <h2 className="text-xl font-bold mb-4 text-black">
            ✅ You scored {score} / {quiz.length}
          </h2>

          {quiz.map((q, idx) => {
            const correct = getCorrectLetter(q);
            const chosen = answers[idx];
            const isCorrect = chosen === correct;

            return (
              <div key={idx} className="mb-6 p-4 border rounded-lg bg-white text-black">
                <p className="font-semibold mb-2">
                  {idx + 1}. {q.question.replace(/(\d\..*)/, "").trim()}
                </p>

                {q.statements && q.statements.length > 0 && (
                  <div className="mb-2 text-black">
                    {q.statements.map((stmt, i) => (
                      <p key={i} className="mb-1">{stmt}</p>
                    ))}
                  </div>
                )}

                <p className="text-black">
                  <span className="font-semibold">Your Answer:</span>{" "}
                  {chosen || "Not answered"}
                </p>
                <p
                  className={`font-semibold ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Correct Answer: {correct}
                </p>
              </div>
            );
          })}

          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setCurrentQ(0);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retake Quiz
          </button>
        </div>
      ) : (
        // Normal Quiz Mode
        <div className="mb-6 p-4 border rounded-lg w-full max-w-2xl bg-white">
          {/* Progress bar / counter */}
          <div className="mb-4">
            <p className="text-black font-semibold">
              Question {currentQ + 1} of {quiz.length}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQ + 1) / quiz.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <p className="font-bold text-black text-lg mb-2">
            {currentQ + 1}. {q.question.replace(/(\d\..*)/, "").trim()}
          </p>

          {/* Statements */}
          {q.statements && q.statements.length > 0 && (
            <div className="mb-4 text-black">
              {q.statements.map((stmt, i) => (
                <p key={i} className="mb-1">{stmt}</p>
              ))}
            </div>
          )}

          {/* Options */}
          <ul>
            {q.options.map((opt, i) => {
              const letter = extractLetter(opt);
              const selected = answers[currentQ] === letter;
              return (
                <li key={i}>
                  <button
                    onClick={() => handleSelect(currentQ, opt)}
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

          {/* Navigation */}
          <div className="flex justify-between mt-4">
            {currentQ > 0 && (
              <button
                onClick={() => setCurrentQ((s) => Math.max(0, s - 1))}
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Previous
              </button>
            )}
            {currentQ < quiz.length - 1 ? (
              <button
                onClick={() => setCurrentQ((s) => Math.min(quiz.length - 1, s + 1))}
                className="bg-blue-600 text-white px-4 py-2 rounded-md ml-auto"
                disabled={!answers[currentQ]}
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setSubmitted(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md ml-auto"
                disabled={!answers[currentQ]}
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
