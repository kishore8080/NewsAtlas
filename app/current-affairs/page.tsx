'use client';

import { useEffect, useState } from 'react';
import { apiConfig } from '@/lib/api-config';
import { BookOpen, Calendar, Tag } from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    date: string;
    source: string;
    relevance: string[];
}

export default function CurrentAffairs() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiConfig.endpoints.news);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading news...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-red-800 font-semibold text-lg mb-2">Error Loading News</h2>
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={fetchNews}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Current Affairs</h1>
                    <p className="text-gray-600">Stay updated with UPSC-relevant news</p>
                </div>
            </div>

            {/* News Grid */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {news.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No news available at the moment</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {news.map((item) => (
                            <article
                                key={item.id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
                            >
                                {/* Category Badge */}
                                <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                                    <span className="inline-flex items-center text-sm font-medium text-blue-700">
                                        <Tag className="w-4 h-4 mr-1" />
                                        {item.category}
                                    </span>
                                </div>


                                {/* Content */}
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {item.title}
                                    </h2>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {item.description}
                                    </p>

                                    {/* Metadata */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                        <span className="flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(item.date).toLocaleDateString()}
                                        </span>
                                        <span>{item.source}</span>
                                    </div>

                                    {/* Relevance Tags */}
                                    {item.relevance && item.relevance.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {item.relevance.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
