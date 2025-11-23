import Link from "next/link";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function DailyQuizWidget() {
    // In a real app, we might fetch today's topic from an API
    const todayTopic = "Current Affairs & General Knowledge";
    const questionCount = 5;

    return (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none overflow-hidden relative">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Daily Quiz</h2>
                        <p className="text-blue-100 text-sm">Test your knowledge today!</p>
                    </div>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        {new Date().toLocaleDateString()}
                    </span>
                </div>

                <div className="mb-6">
                    <p className="text-lg font-medium mb-2">{todayTopic}</p>
                    <div className="flex items-center gap-4 text-sm text-blue-100">
                        <span className="flex items-center gap-1">
                            ❓ {questionCount} Questions
                        </span>
                        <span className="flex items-center gap-1">
                            ⏱️ ~5 Mins
                        </span>
                    </div>
                </div>

                <Link href="/quiz/daily">
                    <Button
                        className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none font-semibold"
                    >
                        Start Quiz Now
                    </Button>
                </Link>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
        </Card>
    );
}
