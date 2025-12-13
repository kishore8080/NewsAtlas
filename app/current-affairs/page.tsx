'use client';

import { useEffect, useState } from 'react';
import { apiConfig } from '@/lib/api-config';
import { BookOpen, Calendar, Tag, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    date: string;
    source: string;
    relevance: string[];
    key_points?: string[];
    importance?: 'High' | 'Medium' | 'Low';
}

export default function CurrentAffairs() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'today' | 'history'>('today');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (mode === 'today') {
            fetchNews();
        } else {
            fetchNews(selectedDate);
        }
    }, [mode, selectedDate]);

    const fetchNews = async (date?: string) => {
        try {
            setLoading(true);
            let url = apiConfig.endpoints.news;

            if (date) {
                // Convert YYYY-MM-DD to DD-MM-YYYY for backend
                const [year, month, day] = date.split('-');
                const formattedDate = `${day}-${month}-${year}`;
                url += `?date=${formattedDate}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }

            const data = await response.json();
            setNews(data.news || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getImportanceColor = (importance?: string) => {
        switch (importance) {
            case 'High': return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Current Affairs</h1>
                            <p className="text-gray-600">Stay updated with UPSC-relevant news</p>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setMode('today')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'today'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setMode('history')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'history'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                History
                            </button>
                        </div>
                    </div>

                    {mode === 'history' && (
                        <div className="mt-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Select Date:</span>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* News Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading news...</p>
                    </div>
                ) : error ? (
                    <div className="text-center max-w-md mx-auto p-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h2 className="text-red-800 font-semibold text-lg mb-2">Error Loading News</h2>
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={() => fetchNews(mode === 'history' ? selectedDate : undefined)}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No news available for this date</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {news.map((item) => (
                            <article
                                key={item.id || Math.random().toString()}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden flex flex-col"
                            >
                                {/* Header with Badges */}
                                <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                        <Tag className="w-3 h-3 mr-1" />
                                        {item.category}
                                    </span>
                                    {item.importance && (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getImportanceColor(item.importance)}`}>
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            {item.importance} Priority
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                                        {item.title}
                                    </h2>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {item.description}
                                    </p>

                                    {/* Key Points */}
                                    {item.key_points && item.key_points.length > 0 && (
                                        <div className="mb-4 bg-gray-50 rounded-lg p-3">
                                            <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Key Points</h3>
                                            <ul className="space-y-1.5">
                                                {item.key_points.map((point, idx) => (
                                                    <li key={idx} className="text-xs text-gray-600 flex items-start">
                                                        <CheckCircle2 className="w-3 h-3 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Relevance Tags */}
                                    {item.relevance && item.relevance.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {item.relevance.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center font-medium">
                                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                        {item.date}
                                    </span>
                                    <span className="font-medium text-gray-700">{item.source}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
