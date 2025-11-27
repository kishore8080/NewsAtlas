import Link from 'next/link';
import {
    BookOpen,
    BrainCircuit,
    Gamepad2,
    LayoutDashboard,
    Newspaper,
    Plus,
    Search
} from 'lucide-react';

export default function Sidebar() {
    return (
        <aside className="w-64 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold">
                        <BookOpen size={20} />
                    </div>
                    <span className="text-white font-semibold text-lg">eazyprepai</span>
                </div>

                <button className="w-full bg-transparent border border-slate-700 text-white p-3 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors mb-6">
                    <Plus size={18} />
                    <span>New chat</span>
                </button>



                <div className="mb-8">

                    <nav className="space-y-1">
                        <Link href="/test-series" className="flex items-center gap-3 p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <BookOpen size={18} />
                            <span>Test Series</span>
                        </Link>
                        <Link href="/performance" className="flex items-center gap-3 p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <LayoutDashboard size={18} />
                            <span>Performance Stats</span>
                        </Link>
                    </nav>
                </div>

                <div>

                    <nav className="space-y-1">
                        <Link href="/current-affairs" className="flex items-center gap-3 p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <Newspaper size={18} />
                            <span>Current Affairs Daily</span>
                        </Link>
                        <Link href="/mind-map" className="flex items-center gap-3 p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <BrainCircuit size={18} />
                            <span>Mind Map Generator</span>
                        </Link>
                        <Link href="/games" className="flex items-center gap-3 p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <Gamepad2 size={18} />
                            <span>Games</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </aside>
    );
}
