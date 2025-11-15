"use client";

import Link from "next/link";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function HomePage() {
  const features = [
    {
      title: "AI Study Planner",
      description: "Personalized study plans that adapt to your pace and performance",
      icon: "📚",
      href: "/study-planner",
    },
    {
      title: "Smart Analytics",
      description: "Track your strengths, weaknesses, and progress in real-time",
      icon: "📊",
      href: "/dashboard",
    },
    {
      title: "Answer Evaluation",
      description: "Get instant, detailed feedback on your descriptive answers",
      icon: "✍️",
      href: "/answer-evaluation",
    },
    {
      title: "Daily Current Affairs",
      description: "Stay updated with the latest news and events",
      icon: "📰",
      href: "/current-affairs",
    },
    {
      title: "AI-Curated Notes",
      description: "Access intelligent notes tailored to your learning needs",
      icon: "📝",
      href: "/notes",
    },
    {
      title: "Interactive Quizzes",
      description: "Practice with daily quizzes and test series",
      icon: "🎯",
      href: "/quiz/daily",
    },
    {
      title: "24/7 AI Mentor",
      description: "Get guidance and support anytime, anywhere",
      icon: "🤖",
      href: "/mentorship",
    },
    {
      title: "Test Series",
      description: "Comprehensive test series to assess your preparation",
      icon: "📋",
      href: "/test-series",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to EazyPrepAI
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Your complete AI-driven companion for UPSC success. Get personalized
            guidance, smart analytics, and 24/7 mentorship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/quiz/daily">
              <Button variant="outline" size="lg">
                Try Daily Quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <Card hover className="h-full">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Ace Your UPSC Exam?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of aspirants who are using AI to prepare smarter
          </p>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
  