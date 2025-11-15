"use client";

import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function StudyPlanner() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Mock study plan data
  const weeklyPlan = [
    { day: "Monday", subjects: ["History", "Geography"], hours: 4 },
    { day: "Tuesday", subjects: ["Polity", "Economics"], hours: 5 },
    { day: "Wednesday", subjects: ["Current Affairs", "Science"], hours: 3 },
    { day: "Thursday", subjects: ["History", "Geography"], hours: 4 },
    { day: "Friday", subjects: ["Polity", "Economics"], hours: 5 },
    { day: "Saturday", subjects: ["Mock Test", "Revision"], hours: 6 },
    { day: "Sunday", subjects: ["Revision", "Weak Topics"], hours: 4 },
  ];

  const todayTasks = [
    { time: "9:00 AM", task: "History - Ancient India", completed: true },
    { time: "11:00 AM", task: "Geography - Physical Geography", completed: true },
    { time: "2:00 PM", task: "Current Affairs Quiz", completed: false },
    { time: "4:00 PM", task: "Revision - Last Week Topics", completed: false },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Study Planner</h1>
          <Button>Generate New Plan</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Overview */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Weekly Study Plan</h2>
              <div className="space-y-3">
                {weeklyPlan.map((day, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900">{day.day}</h3>
                      <span className="text-sm text-gray-600">{day.hours} hours</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {day.subjects.map((subject, subIndex) => (
                        <span
                          key={subIndex}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Today's Schedule */}
          <div>
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Today's Schedule</h2>
              <div className="mb-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                {todayTasks.map((task, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      task.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{task.time}</p>
                        <p
                          className={`font-medium ${
                            task.completed ? "text-green-800 line-through" : "text-gray-900"
                          }`}
                        >
                          {task.task}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Progress */}
            <Card className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">This Week's Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-sm font-semibold text-gray-900">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Hours This Week</p>
                  <p className="text-2xl font-bold text-gray-900">31 / 35 hours</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

