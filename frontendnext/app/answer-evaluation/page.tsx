"use client";

import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function AnswerEvaluation() {
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim() || !question.trim()) {
      alert("Please provide both question and answer");
      return;
    }

    setLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setEvaluation({
        score: 75,
        feedback: [
          "Good understanding of the concept. You've covered the main points clearly.",
          "Consider adding more examples to strengthen your argument.",
          "The structure is logical, but could benefit from a stronger conclusion.",
          "Make sure to cite relevant constitutional provisions or case laws where applicable.",
        ],
        strengths: [
          "Clear articulation of ideas",
          "Good use of relevant terminology",
          "Logical flow of arguments",
        ],
        improvements: [
          "Add more specific examples",
          "Include statistical data if available",
          "Strengthen the conclusion",
        ],
        wordCount: answer.split(" ").length,
      });
      setLoading(false);
    }, 2000);
  };

  const sampleQuestions = [
    "Discuss the significance of the Fundamental Rights in the Indian Constitution.",
    "Explain the impact of climate change on Indian agriculture.",
    "Analyze the role of the Planning Commission in India's economic development.",
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Answer Evaluation</h1>

        {!evaluation ? (
          <div className="space-y-6">
            {/* Question Input */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Question</h2>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Or select a sample question:</p>
                <div className="space-y-2">
                  {sampleQuestions.map((q, index) => (
                    <button
                      key={index}
                      onClick={() => setQuestion(q)}
                      className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Answer Input */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Answer</h2>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your answer here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[300px]"
              />
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {answer.split(" ").length} words
                </span>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Evaluating..." : "Evaluate Answer"}
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Your Score</h2>
                <div className="text-6xl font-bold mb-2">{evaluation.score}%</div>
                <p className="text-blue-100">
                  {evaluation.wordCount} words | {new Date().toLocaleDateString()}
                </p>
              </div>
            </Card>

            {/* Feedback */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Detailed Feedback</h2>
              <div className="space-y-3">
                {evaluation.feedback.map((item: string, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded"
                  >
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Strengths */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-green-700">Strengths</h2>
              <ul className="space-y-2">
                {evaluation.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-red-700">Areas for Improvement</h2>
              <ul className="space-y-2">
                {evaluation.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-600 mr-2">→</span>
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex gap-4">
              <Button onClick={() => setEvaluation(null)} className="flex-1">
                Evaluate Another Answer
              </Button>
              <Button variant="outline" className="flex-1">
                Save Evaluation
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

