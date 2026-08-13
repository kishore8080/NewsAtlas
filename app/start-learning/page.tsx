import Link from 'next/link';

export default function StartLearningPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Start Learning</h1>
          <p className="text-gray-600 mb-8">
            Welcome to EazyPrepAI. Choose a learning path below to begin your UPSC preparation.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/current-affairs"
              className="block rounded-3xl border border-blue-100 bg-blue-50 p-8 hover:border-blue-300 hover:bg-blue-100 transition"
            >
              <h2 className="text-2xl font-semibold text-blue-700 mb-2">Current Affairs</h2>
              <p className="text-gray-700">Read curated news and analyze UPSC-relevant current affairs.</p>
            </Link>

            <Link
              href="/daily-quiz"
              className="block rounded-3xl border border-green-100 bg-green-50 p-8 hover:border-green-300 hover:bg-green-100 transition"
            >
              <h2 className="text-2xl font-semibold text-green-700 mb-2">Daily Quiz</h2>
              <p className="text-gray-700">Test your knowledge with daily quizzes and instant feedback.</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
