import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import { BookOpen, Target } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />

      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <FeatureCard
            icon={BookOpen}
            title="Current Affairs"
            description="Daily updates curated for UPSC aspirants. Track your syllabus coverage with our blueprint."
            linkText="Read News"
            linkHref="/current-affairs"
            iconColorClass="text-blue-600"
            iconBgClass="bg-blue-50"
          />

          <FeatureCard
            icon={Target}
            title="Daily Quizzes"
            description="Test your knowledge with daily MCQs. Get instant feedback and detailed explanations."
            linkText="Take Quiz"
            linkHref="/daily-quiz"
            iconColorClass="text-red-500"
            iconBgClass="bg-red-50"
            linkColorClass="text-red-500"
          />
        </div>
      </section>
    </main>
  );
}
