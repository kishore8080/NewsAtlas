"use client";

import Link from "next/link";
import { ChevronLeft, Globe2 } from "lucide-react";
import { useState } from "react";
import type { HeatmapLegendItem } from "@/lib/heatmap";
import { heatmapLegend } from "@/lib/heatmap";

type AffairsMode = "today" | "history";

type HeatmapHeaderProps = {
  mode: AffairsMode;
  selectedDate: string;
  onModeChange: (mode: AffairsMode) => void;
  onDateChange: (date: string) => void;
};

function LegendItem({ item }: { item: HeatmapLegendItem }) {
  return (
    <li className="heatmap-legend-item">
      <span aria-hidden="true" className={`heatmap-legend-dot ${item.dotClassName}`} />
      <span>{item.label}</span>
    </li>
  );
}

export default function HeatmapHeader({
  mode,
  selectedDate,
  onModeChange,
  onDateChange,
}: HeatmapHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <div aria-hidden="true" className="heatmap-top-chrome" />
      <span aria-hidden="true" className="heatmap-preview-badge">
        Preview
      </span>
      <header className="heatmap-header">
        <div className="heatmap-header-left">
          <Link
            aria-label="Go back to Event Pulse"
            className="heatmap-back-button"
            href="/"
            title="Go back"
          >
            <ChevronLeft aria-hidden="true" size={28} strokeWidth={1.8} />
          </Link>
          <span aria-hidden="true" className="heatmap-title-icon" title="Global events">
            <Globe2 size={24} strokeWidth={1.8} />
          </span>
          <h1 className="heatmap-title">Global News Heatmap</h1>
        </div>

        <div className="heatmap-header-actions">
          <ul aria-label="Event severity legend" className="heatmap-legend" role="list">
            {heatmapLegend.map((item) => (
              <LegendItem item={item} key={item.severity} />
            ))}
          </ul>

          <div className="relative">
            <button
              aria-controls="heatmap-filter-panel"
              aria-expanded={isFilterOpen}
              aria-label="Open heatmap filters"
              className="heatmap-status-button"
              onClick={() => setIsFilterOpen((current) => !current)}
              title="Open heatmap filters"
              type="button"
            >
              Live · Backend
            </button>

            {isFilterOpen && (
              <div
                aria-label="Heatmap filters"
                className="heatmap-filter-panel"
                id="heatmap-filter-panel"
                role="dialog"
              >
                <p className="heatmap-filter-title">Event window</p>
                <div aria-label="Select event window" className="heatmap-filter-modes" role="group">
                  <button
                    className={`heatmap-filter-mode ${mode === "today" ? "is-active" : ""}`}
                    onClick={() => onModeChange("today")}
                    type="button"
                  >
                    Today
                  </button>
                  <button
                    className={`heatmap-filter-mode ${mode === "history" ? "is-active" : ""}`}
                    onClick={() => onModeChange("history")}
                    type="button"
                  >
                    History
                  </button>
                </div>
                <label className="heatmap-filter-label" htmlFor="heatmap-date">
                  Select date
                  <input
                    className="heatmap-filter-input"
                    id="heatmap-date"
                    max={today}
                    onChange={(event) => {
                      const nextDate = event.target.value;
                      onDateChange(nextDate);
                      if (mode !== "history") {
                        onModeChange("history");
                      }
                    }}
                    type="date"
                    value={selectedDate}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
