"use client";

import Card from "../../components/ui/Card";
import Link from "next/link";
import Button from "../../components/ui/Button";

export default function Dashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    totalQuizzes: 45,
    averageScore: 78,
    studyStreak: 12,
    totalHours: 156,
  };

  const recentActivity = [
    { type: "Quiz", name: "Daily Quiz - Current Affairs", date: "Today", score: 85 },
    { type: "Test", name: "Mock Test - History", date: "Yesterday", score: 72 },
    { type: "Note", name: "Polity - Fundamental Rights", date: "2 days ago" },
  ];

  const strengths = ["History", "Geography", "Current Affairs"];
  const weaknesses = ["Economics", "Science & Technology"];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalQuizzes}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Streak</p>
                <p className="text-3xl font-bold text-gray-900">{stats.studyStreak} days</p>
              </div>
              <div className="text-4xl">🔥</div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalHours}</p>
              </div>
              <div className="text-4xl">⏱️</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{activity.name}</p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                    {activity.score && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {activity.score}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div>
            <Card className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Strengths</h2>
              <div className="space-y-2">
                {strengths.map((subject, index) => (
                  <div
                    key={index}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <p className="font-medium text-green-800">{subject}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Areas to Improve</h2>
              <div className="space-y-2">
                {weaknesses.map((subject, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="font-medium text-red-800">{subject}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/quiz/daily">
                <Button className="w-full">Daily Quiz</Button>
              </Link>
              <Link href="/study-planner">
                <Button variant="outline" className="w-full">Study Planner</Button>
              </Link>
              <Link href="/answer-evaluation">
                <Button variant="outline" className="w-full">Evaluate Answer</Button>
              </Link>
              <Link href="/mentorship">
                <Button variant="outline" className="w-full">AI Mentor</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

