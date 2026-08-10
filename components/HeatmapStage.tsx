import Image from "next/image";
import { X } from "lucide-react";
import type { HeatmapMarker, NewsItem } from "@/lib/heatmap";
import { getSeverityLabel, heatmapMarkers } from "@/lib/heatmap";

type HeatmapStageProps = {
  selectedMarker: HeatmapMarker | null;
  selectedNews?: NewsItem;
  onSelectMarker: (marker: HeatmapMarker) => void;
  onCloseDetails: () => void;
};

export default function HeatmapStage({
  selectedMarker,
  selectedNews,
  onSelectMarker,
  onCloseDetails,
}: HeatmapStageProps) {
  return (
    <section aria-label="Global news event heatmap" className="heatmap-stage" role="region">
      <Image
        alt="Textured global map showing continent regions and colored news event markers"
        className="heatmap-image"
        decoding="async"
        height={944}
        priority
        sizes="(max-width: 874px) calc(100vw - 24px), 850px"
        src="/assets/global-news-heatmap-reference.png"
        width={1389}
      />

      {heatmapMarkers.map((marker) => {
        const isSelected = selectedMarker?.id === marker.id;

        return (
          <button
            aria-label={`View ${marker.label} event details`}
            aria-pressed={isSelected}
            className="heatmap-event-hit"
            key={marker.id}
            onClick={() => onSelectMarker(marker)}
            style={{ left: marker.left, top: marker.top }}
            title={`${marker.label} · ${getSeverityLabel(marker.severity)} activity`}
            type="button"
          />
        );
      })}

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
            {selectedNews?.title ??
              `Global events currently show ${getSeverityLabel(selectedMarker.severity).toLowerCase()} activity in this region.`}
          </p>
        </div>
      )}
    </section>
  );
}
