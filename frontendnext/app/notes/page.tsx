"use client";

import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function Notes() {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const subjects = [
    "all",
    "History",
    "Geography",
    "Polity",
    "Economics",
    "Science",
    "Current Affairs",
  ];

  // Mock notes data
  const notes = [
    {
      id: 1,
      title: "Ancient India - Mauryan Empire",
      subject: "History",
      date: "2024-01-15",
      summary: "Comprehensive notes on the Mauryan Empire, covering Chandragupta Maurya, Ashoka, and administrative systems.",
      topics: ["Chandragupta Maurya", "Ashoka", "Administration", "Decline"],
    },
    {
      id: 2,
      title: "Fundamental Rights - Indian Constitution",
      subject: "Polity",
      date: "2024-01-14",
      summary: "Detailed explanation of all fundamental rights enshrined in the Indian Constitution with case studies.",
      topics: ["Article 12-35", "Right to Equality", "Right to Freedom", "Constitutional Remedies"],
    },
    {
      id: 3,
      title: "Physical Geography - Climate Zones",
      subject: "Geography",
      date: "2024-01-13",
      summary: "Understanding global climate zones, their characteristics, and impact on human settlements.",
      topics: ["Tropical", "Temperate", "Polar", "Climate Change"],
    },
    {
      id: 4,
      title: "Indian Economy - Fiscal Policy",
      subject: "Economics",
      date: "2024-01-12",
      summary: "Analysis of India's fiscal policy, budget components, and economic implications.",
      topics: ["Budget", "Taxation", "Public Debt", "Fiscal Deficit"],
    },
  ];

  const filteredNotes = notes.filter((note) => {
    const matchesSubject = selectedSubject === "all" || note.subject === selectedSubject;
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI-Curated Notes</h1>
          <Button>Generate New Notes</Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSubject === subject
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.id} hover className="flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                  {note.subject}
                </span>
                <span className="text-sm text-gray-500">{note.date}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{note.title}</h3>
              <p className="text-gray-600 mb-4 flex-grow">{note.summary}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {note.topics.slice(0, 3).map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {topic}
                  </span>
                ))}
                {note.topics.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{note.topics.length - 3} more
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-gray-600">No notes found. Try adjusting your filters.</p>
          </Card>
        )}
      </div>
    </main>
  );
}

