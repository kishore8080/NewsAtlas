import Link from 'next/link';
// Actually, I'll stick to raw Tailwind for simplicity unless I install shadcn.
// The plan didn't explicitly say shadcn, just Tailwind.

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 text-white p-1 rounded-md">
          <span className="font-bold text-xl">E</span>
        </div>
        <span className="font-bold text-xl text-gray-900">EazyPrepAI</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <Link href="/" className="text-blue-600 font-medium">
          Home
        </Link>
        <Link href="/current-affairs" className="text-gray-600 hover:text-gray-900 font-medium">
          Current Affairs
        </Link>
        <Link href="/daily-quiz" className="text-gray-600 hover:text-gray-900 font-medium">
          Daily Quiz
        </Link>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Sign In
        </button>
      </div>
    </nav>
  );
}
