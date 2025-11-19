"use client";

import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function CurrentAffairs() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "national", "international", "economy", "science", "sports"];

  // Mock current affairs data
  const newsItems = [
    {
      id: 1,
      title: "India's GDP Growth Rate Reaches 7.8% in Q2",
      category: "economy",
      date: "2024-01-15",
      summary: "India's economy shows strong growth momentum with GDP expanding at 7.8% in the second quarter, driven by robust manufacturing and services sectors.",
      tags: ["Economy", "GDP", "Growth"],
    },
    {
      id: 2,
      title: "New Climate Change Agreement Signed at COP28",
      category: "international",
      date: "2024-01-14",
      summary: "World leaders reach consensus on new climate targets, focusing on renewable energy transition and carbon neutrality by 2050.",
      tags: ["Climate", "International", "Environment"],
    },
    {
      id: 3,
      title: "ISRO Launches New Satellite for Earth Observation",
      category: "science",
      date: "2024-01-13",
      summary: "Indian Space Research Organisation successfully launches advanced satellite for enhanced earth observation and climate monitoring capabilities.",
      tags: ["Science", "Space", "ISRO"],
    },
    {
      id: 4,
      title: "New Education Policy Implementation Updates",
      category: "national",
      date: "2024-01-12",
      summary: "Government releases detailed guidelines for implementing the New Education Policy across states, focusing on skill development and digital learning.",
      tags: ["Education", "Policy", "National"],
    },
  ];

  const filteredNews =
    selectedCategory === "all"
      ? newsItems
      : newsItems.filter((item) => item.category === selectedCategory);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Current Affairs</h1>
          <Button>Subscribe to Updates</Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* News Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNews.map((item) => (
            <Card key={item.id} hover>
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                  {item.category.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">{item.date}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.summary}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm">
                Read More
              </Button>
            </Card>
          ))}
        </div>

        {/* Daily Quiz CTA */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Test Your Knowledge</h3>
              <p className="text-blue-100">
                Take today&apos;s current affairs quiz to reinforce your learning
              </p>
            </div>
            <a href="/quiz/daily">
              <Button variant="secondary" size="lg">
                Start Quiz
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </main>
  );
}

