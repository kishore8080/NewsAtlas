"use client";

import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import HelpButton from "@/components/HelpButton";
import HeatmapHeader from "@/components/HeatmapHeader";
import HeatmapStage from "@/components/HeatmapStage";
import type { HeatmapMarker, NewsItem } from "@/lib/heatmap";
import { createHeatmapMarkers } from "@/lib/heatmap";

type AffairsMode = "today" | "history";

type GlobalNewsHeatmapProps = {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  mode: AffairsMode;
  selectedDate: string;
  onModeChange: (mode: AffairsMode) => void;
  onDateChange: (date: string) => void;
  onRetry: () => void;
};

export default function GlobalNewsHeatmap({
  news,
  loading,
  error,
  mode,
  selectedDate,
  onModeChange,
  onDateChange,
  onRetry,
}: GlobalNewsHeatmapProps) {
  const [selectedMarkerState, setSelectedMarkerState] = useState<{
    filterKey: string;
    markerId: string;
  } | null>(null);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const markers = useMemo(() => createHeatmapMarkers(news), [news]);
  const filterKey = `${mode}:${selectedDate}`;
  const selectedMarkerId = selectedMarkerState?.filterKey === filterKey ? selectedMarkerState.markerId : null;
  const selectedMarker: HeatmapMarker | null = selectedMarkerId
    ? markers.find((marker) => marker.id === selectedMarkerId) ?? null
    : null;

  return (
    <main aria-busy={loading} className="heatmap-screen">
      <HeatmapHeader
        mode={mode}
        onDateChange={onDateChange}
        onModeChange={onModeChange}
        selectedDate={selectedDate}
      />

      <div className="heatmap-main">
        <HeatmapStage
          markers={markers}
          onCloseDetails={() => setSelectedMarkerState(null)}
          onSelectMarker={(marker) => setSelectedMarkerState({ filterKey, markerId: marker.id })}
          onTileError={() => setTilesUnavailable(true)}
          onTileLoad={() => setTilesUnavailable(false)}
          selectedMarker={selectedMarker}
          selectedMarkerId={selectedMarkerId}
          tilesUnavailable={tilesUnavailable}
        />

        {loading && (
          <div aria-live="polite" className="heatmap-feedback" role="status">
            <p className="heatmap-feedback-title">Loading global events…</p>
          </div>
        )}

        {!loading && error && (
          <div aria-live="assertive" className="heatmap-feedback heatmap-feedback-error" role="alert">
            <p className="heatmap-feedback-title">Unable to load global events</p>
            <p className="heatmap-feedback-copy">{error}</p>
            <button className="heatmap-retry-button" onClick={onRetry} type="button">
              <RefreshCw aria-hidden="true" size={14} />
              Try again
            </button>
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div aria-live="polite" className="heatmap-feedback" role="status">
            <p className="heatmap-feedback-title">No global events available</p>
            <p className="heatmap-feedback-copy">Try another date from the heatmap filters.</p>
          </div>
        )}
      </div>

      <HelpButton label="Open help" />
    </main>
  );
}
