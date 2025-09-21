"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 text-gray-900 px-6">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
        UPSC Daily Quiz
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-gray-700 mb-10 text-center max-w-2xl">
        Test your knowledge with daily current affairs based MCQs tailored for
        UPSC preparation.
      </p>

      {/* CTA Button */}
      <Link
        href="/quiz/daily"
        className="px-6 py-3 text-lg font-semibold rounded-xl shadow-md bg-black text-white hover:bg-gray-800 transition"
      >
        Start Daily Quiz
      </Link>
    </main>
  );
}
