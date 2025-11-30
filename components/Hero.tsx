import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 bg-blue-50/30">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Master UPSC with <span className="text-blue-600">EazyPrepAI</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
                Your intelligent companion for Civil Services preparation. Stay updated with
                current affairs and practice daily quizzes.
            </p>

            <Link
                href="/start-learning"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-lg transition-all transform hover:scale-105"
            >
                Start Learning Now
                <ArrowRight className="w-5 h-5" />
            </Link>
        </section>
    );
}
