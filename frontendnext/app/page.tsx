"use client";

import { Play } from 'lucide-react';
import QuizCard from "@/components/QuizCard";

export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Available Quizzes</h1>
        <p className="text-slate-500">Practice with topic-wise quizzes</p>
      </div>

      <div className="space-y-6">
        <QuizCard
          subject="Polity"
          title="Indian Polity - Fundamental Rights"
          questions={25}
          time="30 mins"
          difficulty="Medium"
        />

        <div className="w-full bg-[var(--sidebar-bg)] rounded-xl p-4 flex items-center justify-center mb-6 cursor-pointer hover:bg-slate-900 transition-colors">
          <div className="flex items-center gap-2 text-white font-medium">
            <Play size={20} fill="currentColor" />
            <span>Start Quiz</span>
          </div>
        </div>

        <QuizCard
          subject="History"
          title="Modern Indian History - Freedom Struggle"
          questions={30}
          time="40 mins"
          difficulty="Hard"
          score={82}
        />

        <QuizCard
          subject="Geography"
          title="Indian Geography - Physical Features"
          questions={20}
          time="25 mins"
          difficulty="Easy"
        />
      </div>
    </div>
  );
}