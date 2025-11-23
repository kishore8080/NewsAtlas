"use client";

import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Link from "next/link";
import Button from "../../components/ui/Button";
import DailyQuizWidget from "../../components/dashboard/DailyQuizWidget";
import { getDashboardStats, DashboardStats } from "@/lib/storage";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    averageScore: 0,
    studyStreak: 0,
    totalHours: 0,
    recentActivity: [],
  });

  useEffect(() => {
    // Load stats from local storage on mount
    const data = getDashboardStats();
    setStats(data);
  }, []);

  const strengths = ["History", "Geography", "Current Affairs"];
  const weaknesses = ["Economics", "Science & Technology"];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Stats Area - Left 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500 mb-1">Total Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500 mb-1">Avg. Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500 mb-1">Study Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.studyStreak} <span className="text-sm font-normal text-gray-500">days</span></p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500 mb-1">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <Link href="/history" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </Link>
              </div>

              {stats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          Q
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.topic}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.date).toLocaleDateString()} • {activity.totalQuestions} Questions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${(activity.score / activity.totalQuestions) >= 0.7
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                          }`}>
                          {Math.round((activity.score / activity.totalQuestions) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>No recent activity. Start a quiz to see your progress!</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="space-y-6">
            <DailyQuizWidget />

            <Card>
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/study-planner" className="block">
                  <Button variant="outline" className="w-full justify-start">📅 Study Planner</Button>
                </Link>
                <Link href="/answer-evaluation" className="block">
                  <Button variant="outline" className="w-full justify-start">📝 Evaluate Answer</Button>
                </Link>
                <Link href="/mentorship" className="block">
                  <Button variant="outline" className="w-full justify-start">🤖 AI Mentor</Button>
                </Link>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Performance</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {strengths.map((s) => (
                      <span key={s} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md border border-green-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Areas to Improve</p>
                  <div className="flex flex-wrap gap-2">
                    {weaknesses.map((w) => (
                      <span key={w} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-100">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

