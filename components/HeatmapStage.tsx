"use client";

import dynamic from "next/dynamic";
import { X } from "lucide-react";
import type { HeatmapMarker } from "@/lib/heatmap";
import { getSeverityLabel } from "@/lib/heatmap";

const LeafletHeatmap = dynamic(() => import("@/components/LeafletHeatmap"), {
  ssr: false,
  loading: () => <div aria-live="polite" className="heatmap-map-loading">Loading map…</div>,
});

type HeatmapStageProps = {
  markers: HeatmapMarker[];
  selectedMarker: HeatmapMarker | null;
  selectedMarkerId: string | null;
  onSelectMarker: (marker: HeatmapMarker) => void;
  onCloseDetails: () => void;
  onTileError: () => void;
  onTileLoad: () => void;
  tilesUnavailable: boolean;
};

export default function HeatmapStage({
  markers,
  selectedMarker,
  selectedMarkerId,
  onSelectMarker,
  onCloseDetails,
  onTileError,
  onTileLoad,
  tilesUnavailable,
}: HeatmapStageProps) {
  return (
    <section aria-label="Global news event heatmap" className="heatmap-stage" role="region">
      <LeafletHeatmap
        markers={markers}
        onSelectMarker={onSelectMarker}
        onTileError={onTileError}
        onTileLoad={onTileLoad}
        selectedMarkerId={selectedMarkerId}
      />

      {tilesUnavailable && (
        <div aria-live="polite" className="heatmap-tile-fallback" role="status">
          <strong>Map tiles are unavailable</strong>
          <span>Event markers remain available.</span>
        </div>
      )}

      {selectedMarker && (
        <div aria-live="polite" className="heatmap-detail-panel" role="status">
          <div className="heatmap-detail-heading">
            <span>
              {selectedMarker.label} · {getSeverityLabel(selectedMarker.severity)} activity
            </span>
            <button
              aria-label="Close event details"
              className="heatmap-detail-close"
              onClick={onCloseDetails}
              title="Close event details"
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>
          <p className="heatmap-detail-copy">
            {selectedMarker.news.title} — {selectedMarker.news.description}
          </p>
        </div>
      )}
    </section>
  );
}
