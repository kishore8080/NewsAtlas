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
  let markerHtml = "";

  if (marker.severity === "very-high" || marker.severity === "high") {
    // White location pin with inner blue dot matching screenshot
    markerHtml = `
      <div class="custom-map-pin ${selectedClass}">
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
          <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 28 12 28C12 28 24 21 24 12C24 5.37 18.63 0 12 0ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="#FFFFFF"/>
          <circle cx="12" cy="12" r="3.5" fill="#5e81b4"/>
        </svg>
      </div>
    `;
  } else if (marker.severity === "moderate") {
    // White target concentric circle pin
    markerHtml = `
      <div class="custom-map-target ${selectedClass}">
        <div class="w-6 h-6 rounded-full border-2 border-white bg-white/30 flex items-center justify-center shadow-lg">
          <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
        </div>
      </div>
    `;
  } else {
    // White flag pin
    markerHtml = `
      <div class="custom-map-flag ${selectedClass}">
        <div class="w-6 h-6 rounded-full bg-white text-[#0f1826] flex items-center justify-center shadow-md border border-white/80">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
        </div>
      </div>
    `;
  }

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: markerHtml,
    iconAnchor: [12, 28],
    iconSize: [24, 28],
    popupAnchor: [0, -28],
  });
}

function FitMarkers({ markers }: { markers: HeatmapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    if (markers.length === 0) {
      map.setView([20, 0], 2.5, { animate: false });
      return;
    }

    if (markers.length === 1) {
      map.setView([markers[0].latitude, markers[0].longitude], 4, { animate: false });
      return;
    }

    const bounds = L.latLngBounds(
      markers.map((marker) => [marker.latitude, marker.longitude] as [number, number]),
    );

    map.fitBounds(bounds.pad(0.2), {
      animate: false,
      maxZoom: 4,
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
      maxBoundsViscosity={0.8}
      maxZoom={10}
      minZoom={2}
      scrollWheelZoom
      zoom={2.5}
      worldCopyJump
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        eventHandlers={{
          tileerror: onTileError,
          tileload: onTileLoad,
        }}
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
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
                <p className="heatmap-popup-kicker text-[#5e81b4]">
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
