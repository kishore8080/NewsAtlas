import { Send, Sparkles, Bot } from 'lucide-react';

export default function AIAssistant() {
    return (
        <aside className="w-80 bg-white border-l border-[var(--card-border)] flex flex-col h-screen fixed right-0 top-0 shadow-sm">
            <div className="p-6 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="font-semibold">AI Study Assistant</h2>
                        <p className="text-xs text-white/80">Your 24/7 UPSC mentor</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background)]">
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white shrink-0">
                        <Bot size={16} />
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-[var(--card-border)] text-sm text-[var(--foreground)]">
                        <p className="mb-3 font-medium">Hello! I&apos;m your UPSC preparation AI assistant. I can help you with:</p>
                        <ul className="space-y-2 list-disc pl-4 text-slate-600">
                            <li>Explaining concepts from any subject</li>
                            <li>Suggesting study strategies</li>
                            <li>Answering questions about current affairs</li>
                            <li>Providing tips for exam preparation</li>
                        </ul>
                        <p className="mt-3 font-medium text-[var(--primary)]">How can I assist you today?</p>
                        <span className="text-[10px] text-slate-400 mt-2 block text-right">04:38 PM</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-[var(--card-border)]">
                <div className="bg-[var(--background)] rounded-xl p-3 border border-[var(--card-border)] focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:border-transparent transition-all">
                    <textarea
                        placeholder="Ask anything about UPSC preparation..."
                        className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm h-12 outline-none placeholder:text-slate-400"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-slate-400">Press Enter to send, Shift + Enter for new line</span>
                        <button className="p-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--accent)] transition-colors">
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
