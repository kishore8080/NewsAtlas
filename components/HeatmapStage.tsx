"use client";

import dynamic from "next/dynamic";
import { X, Calendar, Tag } from "lucide-react";
import type { HeatmapMarker } from "@/lib/heatmap";
import { getSeverityLabel } from "@/lib/heatmap";

const LeafletHeatmap = dynamic(() => import("@/components/LeafletHeatmap"), {
  ssr: false,
  loading: () => (
    <div aria-live="polite" className="heatmap-map-loading flex flex-col items-center justify-center gap-3 bg-[#020711] text-[#8690a7]">
      <div className="w-8 h-8 border-2 border-[#8176ff] border-t-transparent rounded-full animate-spin" />
      <span>Loading Interactive Map…</span>
    </div>
  ),
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
          <strong>Map tiles loading</strong>
          <span>Event markers remain fully interactive.</span>
        </div>
      )}

      {selectedMarker && (
        <div
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(480px,calc(100vw-32px))] p-5 rounded-2xl bg-[#091224]/95 backdrop-blur-md border border-[#263650] text-[#d7deed] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300"
          role="status"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                selectedMarker.severity === 'very-high' ? 'bg-[#ff3345]' :
                selectedMarker.severity === 'high' ? 'bg-[#ff7900]' :
                selectedMarker.severity === 'moderate' ? 'bg-[#317cf0]' : 'bg-[#14b9aa]'
              }`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8176ff]">
                {selectedMarker.label} · {getSeverityLabel(selectedMarker.severity)} Activity
              </span>
            </div>
            <button
              aria-label="Close event details"
              className="p-1 rounded-lg text-[#8690a7] hover:text-white hover:bg-[#1d2a3d] transition-colors"
              onClick={onCloseDetails}
              title="Close event details"
              type="button"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>

          <h3 className="text-base font-semibold text-white leading-snug mb-2">
            {selectedMarker.news.title}
          </h3>

          <p className="text-xs text-[#aab6ca] leading-relaxed mb-4">
            {selectedMarker.news.description}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-[#1d2a3d] text-xs text-[#8690a7]">
            <div className="flex items-center gap-3">
              {selectedMarker.news.category && (
                <span className="flex items-center gap-1 text-[#8176ff]">
                  <Tag size={12} />
                  {selectedMarker.news.category}
                </span>
              )}
              {selectedMarker.news.date && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {selectedMarker.news.date}
                </span>
              )}
            </div>

            <span className="text-xs font-medium text-[#4b5d79]">
              {selectedMarker.news.source || 'UPSC Prep'}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
