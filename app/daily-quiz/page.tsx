'use client';

import { useEffect, useState } from 'react';
import { apiConfig } from '@/lib/api-config';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
    topic: string;
}

export default function DailyQuiz() {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchQuiz();
    }, []);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiConfig.endpoints.quizDaily);

            if (!response.ok) {
                throw new Error('Failed to fetch quiz');
            }

            const data = await response.json();
            setQuestions(data.questions || []);
            setSelectedAnswers(new Array(data.questions?.length || 0).fill(-1));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (answerIndex: number) => {
        if (showResults) return;

        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestion] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = () => {
        setShowResults(true);
    };

    const calculateScore = () => {
        return selectedAnswers.reduce((score, answer, index) => {
            return answer === questions[index].correct_answer ? score + 1 : score;
        }, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-red-800 font-semibold text-lg mb-2">Error Loading Quiz</h2>
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={fetchQuiz}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No quiz available today</p>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    const score = calculateScore();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Quiz</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600">
                            Question {currentQuestion + 1} of {questions.length}
                        </p>
                        {showResults && (
                            <div className="text-lg font-semibold text-red-600">
                                Score: {score}/{questions.length}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quiz Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Topic Badge */}
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full">
                            {currentQ.topic}
                        </span>
                    </div>

                    {/* Question */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        {currentQ.question}
                    </h2>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                        {currentQ.options.map((option, index) => {
                            const isSelected = selectedAnswers[currentQuestion] === index;
                            const isCorrect = index === currentQ.correct_answer;
                            const showCorrectness = showResults && isSelected;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={showResults}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${showResults
                                            ? isCorrect
                                                ? 'border-green-500 bg-green-50'
                                                : isSelected
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200 bg-gray-50'
                                            : isSelected
                                                ? 'border-red-500 bg-red-50'
                                                : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-900">{option}</span>
                                        {showResults && isCorrect && (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        )}
                                        {showCorrectness && !isCorrect && (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation (shown after submission) */}
                    {showResults && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">Explanation:</h3>
                            <p className="text-blue-800">{currentQ.explanation}</p>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8">
                        <button
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>

                        <div className="flex gap-2">
                            {!showResults && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={selectedAnswers.includes(-1)}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Submit Quiz
                                </button>
                            )}

                            {currentQuestion < questions.length - 1 && (
                                <button
                                    onClick={handleNext}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-6 flex gap-2 justify-center">
                    {questions.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentQuestion(index)}
                            className={`w-8 h-8 rounded-full text-sm font-medium transition ${index === currentQuestion
                                    ? 'bg-red-600 text-white'
                                    : selectedAnswers[index] !== -1
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
