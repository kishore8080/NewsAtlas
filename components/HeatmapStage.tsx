"use client";

import dynamic from "next/dynamic";
import { X, Globe } from "lucide-react";
import type { HeatmapMarker } from "@/lib/heatmap";
import { getSeverityLabel } from "@/lib/heatmap";

const LeafletHeatmap = dynamic(() => import("@/components/LeafletHeatmap"), {
  ssr: false,
  loading: () => (
    <div aria-live="polite" className="heatmap-map-loading flex flex-col items-center justify-center gap-3 bg-[#0b1424] text-[#7494c0]">
      <div className="w-8 h-8 border-2 border-[#688bbd] border-t-transparent rounded-full animate-spin" />
      <span>Loading Slate-Blue Map…</span>
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
        <div aria-live="polite" className="heatmap-tile-fallback bg-white text-slate-800 shadow-xl border border-slate-200" role="status">
          <strong>Map tiles loading</strong>
          <span className="text-slate-500">Event markers remain fully active.</span>
        </div>
      )}

      {selectedMarker && (
        <div
          aria-live="polite"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[min(440px,calc(100vw-32px))] p-6 rounded-2xl bg-white text-[#0f1826] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
          role="status"
        >
          <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5e81b4]/15 flex items-center justify-center text-[#5e81b4]">
                <Globe size={22} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5e81b4]">
                  {selectedMarker.label}
                </h4>
                <p className="text-xs font-medium text-slate-500">
                  {getSeverityLabel(selectedMarker.severity)} Activity
                </p>
              </div>
            </div>

            <button
              aria-label="Close event details"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              onClick={onCloseDetails}
              title="Close event details"
              type="button"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
            {selectedMarker.news.title}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            {selectedMarker.news.description}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="font-semibold text-[#5e81b4] px-2.5 py-1 rounded-md bg-[#5e81b4]/10">
              {selectedMarker.news.category || "Current Affairs"}
            </span>
            <span>{selectedMarker.news.source || "UPSC Prep"} · {selectedMarker.news.date}</span>
          </div>
        </div>
      )}
    </section>
  );
}
