"use client";

import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Link from "next/link";

export default function TestSeries() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "prelims", "mains", "mock", "subject-wise"];

  // Mock test series data
  const tests = [
    {
      id: 1,
      title: "UPSC Prelims Mock Test 2024 - Set 1",
      category: "prelims",
      duration: "120 minutes",
      questions: 100,
      difficulty: "Medium",
      date: "2024-01-20",
      status: "upcoming",
    },
    {
      id: 2,
      title: "History Subject Test - Ancient India",
      category: "subject-wise",
      duration: "60 minutes",
      questions: 50,
      difficulty: "Easy",
      date: "Available Now",
      status: "available",
    },
    {
      id: 3,
      title: "Mains Test Series - GS Paper 1",
      category: "mains",
      duration: "180 minutes",
      questions: 20,
      difficulty: "Hard",
      date: "2024-01-18",
      status: "upcoming",
    },
    {
      id: 4,
      title: "Full Length Mock Test - Complete Syllabus",
      category: "mock",
      duration: "240 minutes",
      questions: 200,
      difficulty: "Hard",
      date: "2024-01-25",
      status: "upcoming",
    },
    {
      id: 5,
      title: "Current Affairs Test - January 2024",
      category: "prelims",
      duration: "90 minutes",
      questions: 75,
      difficulty: "Medium",
      date: "Available Now",
      status: "available",
    },
    {
      id: 6,
      title: "Geography Subject Test - Physical Geography",
      category: "subject-wise",
      duration: "60 minutes",
      questions: 50,
      difficulty: "Medium",
      date: "Available Now",
      status: "available",
    },
  ];

  const filteredTests =
    selectedCategory === "all"
      ? tests
      : tests.filter((test) => test.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Series</h1>
            <p className="text-gray-600 mt-2">
              Comprehensive test series to assess your UPSC preparation
            </p>
          </div>
          <Button>View My Results</Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {category === "all"
                ? "All Tests"
                : category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} hover className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                  {test.category.toUpperCase()}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${getDifficultyColor(
                    test.difficulty
                  )}`}
                >
                  {test.difficulty}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{test.title}</h3>
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Duration:</span>
                  <span>{test.duration}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Questions:</span>
                  <span>{test.questions}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Date:</span>
                  <span>{test.date}</span>
                </div>
              </div>
              <div className="mt-auto">
                {test.status === "available" ? (
                  <Link href={`/test-series/${test.id}`}>
                    <Button className="w-full">Start Test</Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-gray-600">No tests found in this category.</p>
          </Card>
        )}

        {/* Performance Summary */}
        <Card className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 mb-2">12</p>
              <p className="text-gray-600">Tests Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 mb-2">78%</p>
              <p className="text-gray-600">Average Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 mb-2">5</p>
              <p className="text-gray-600">Rank Improvement</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

