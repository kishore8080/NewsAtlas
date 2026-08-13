"use client";

import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo } from "react";
import type { HeatmapMarker } from "@/lib/heatmap";
import { getSeverityLabel } from "@/lib/heatmap";

type LeafletHeatmapProps = {
  markers: HeatmapMarker[];
  selectedMarkerId: string | null;
  onSelectMarker: (marker: HeatmapMarker) => void;
  onTileError: () => void;
  onTileLoad: () => void;
};

function createMarkerIcon(marker: HeatmapMarker, isSelected: boolean) {
  const selectedClass = isSelected ? " is-selected" : "";
  const severityClass = `heatmap-marker-${marker.severity}`;

  return L.divIcon({
    className: "heatmap-event-icon",
    html: `<span aria-hidden="true" class="heatmap-marker ${severityClass}${selectedClass}"></span>`,
    iconAnchor: [14, 14],
    iconSize: [28, 28],
    popupAnchor: [0, -14],
  });
}

function FitMarkers({ markers }: { markers: HeatmapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) {
      map.setView([20, 0], 2, { animate: false });
      return;
    }

    if (markers.length === 1) {
      map.setView([markers[0].latitude, markers[0].longitude], 3, { animate: false });
      return;
    }

    const bounds = L.latLngBounds(
      markers.map((marker) => [marker.latitude, marker.longitude] as [number, number]),
    );

    map.fitBounds(bounds.pad(0.35), {
      animate: false,
      maxZoom: 3,
    });
  }, [map, markers]);

  return null;
}

export default function LeafletHeatmap({
  markers,
  selectedMarkerId,
  onSelectMarker,
  onTileError,
  onTileLoad,
}: LeafletHeatmapProps) {
  const markerIcons = useMemo(
    () =>
      new Map(
        markers.map((marker) => [
          `${marker.id}:${marker.id === selectedMarkerId ? "selected" : "default"}`,
          createMarkerIcon(marker, marker.id === selectedMarkerId),
        ]),
      ),
    [markers, selectedMarkerId],
  );

  return (
    <MapContainer
      center={[20, 0]}
      className="heatmap-leaflet-map"
      maxBounds={[
        [-85, -180],
        [85, 180],
      ]}
      maxBoundsViscosity={1}
      maxZoom={6}
      minZoom={2}
      scrollWheelZoom
      zoom={2}
      worldCopyJump
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        eventHandlers={{
          tileerror: onTileError,
          tileload: onTileLoad,
        }}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitMarkers markers={markers} />

      {markers.map((marker) => {
        const iconKey = `${marker.id}:${marker.id === selectedMarkerId ? "selected" : "default"}`;
        const markerTitle = `${marker.label} · ${getSeverityLabel(marker.severity)} activity`;

        return (
          <Marker
            alt={`View ${markerTitle}`}
            eventHandlers={{
              click: () => onSelectMarker(marker),
              keypress: (event) => {
                const key = (event.originalEvent as KeyboardEvent).key;
                if (key === "Enter" || key === " ") {
                  event.originalEvent.preventDefault();
                  onSelectMarker(marker);
                }
              },
            }}
            icon={markerIcons.get(iconKey)}
            keyboard
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            title={markerTitle}
          >
            <Popup closeButton>
              <article className="heatmap-popup">
                <p className="heatmap-popup-kicker">
                  {marker.label} · {getSeverityLabel(marker.severity)} activity
                </p>
                <h2 className="heatmap-popup-title">{marker.news.title}</h2>
                <p className="heatmap-popup-description">{marker.news.description}</p>
                <p className="heatmap-popup-meta">
                  {marker.news.source} · {marker.news.date}
                </p>
              </article>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
