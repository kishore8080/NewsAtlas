import { Clock, HelpCircle, Play, RotateCcw, Trophy } from 'lucide-react';

interface QuizCardProps {
    subject: string;
    title: string;
    questions: number;
    time: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    score?: number;
}

export default function QuizCard({ subject, title, questions, time, difficulty, score }: QuizCardProps) {
    const difficultyColor = {
        Easy: 'bg-green-100 text-green-700',
        Medium: 'bg-yellow-100 text-yellow-700',
        Hard: 'bg-red-100 text-red-700',
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--card-border)] hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                    {subject}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${difficultyColor[difficulty]}`}>
                    {difficulty}
                </span>
            </div>

            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">{title}</h3>

            <div className="flex items-center gap-6 text-slate-500 text-sm mb-6">
                <div className="flex items-center gap-2">
                    <HelpCircle size={16} />
                    <span>{questions} Questions</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{time}</span>
                </div>
            </div>

            {score !== undefined ? (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[var(--primary)] font-semibold">
                        <Trophy size={18} />
                        <span>Score: {score}%</span>
                    </div>
                    <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <RotateCcw size={16} />
                        Retry
                    </button>
                </div>
            ) : (
                <button className="w-full py-3 bg-[var(--sidebar-bg)] text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                    <Play size={18} fill="currentColor" />
                    Start Quiz
                </button>
            )}
        </div>
    );
}
