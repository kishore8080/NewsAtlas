"use client";

import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo } from "react";
import type { HeatmapMarker, HeatmapSeverity } from "@/lib/heatmap";
import { getSeverityLabel } from "@/lib/heatmap";
import { indiaBoundaryGeoJSON } from "@/lib/india-boundary";

type LeafletHeatmapProps = {
  markers: HeatmapMarker[];
  selectedMarkerId: string | null;
  onSelectMarker: (marker: HeatmapMarker) => void;
  onTileError: () => void;
  onTileLoad: () => void;
};

type MarkerClusterGroup = {
  clusterId: string;
  latitude: number;
  longitude: number;
  markers: HeatmapMarker[];
  maxSeverity: HeatmapSeverity;
};

const severityRank: Record<HeatmapSeverity, number> = {
  "very-high": 4,
  high: 3,
  moderate: 2,
  low: 1,
};

function createMarkerIcon(marker: HeatmapMarker, isSelected: boolean) {
  const selectedClass = isSelected ? " is-selected" : "";
  let markerHtml = "";

  if (marker.severity === "very-high" || marker.severity === "high") {
    markerHtml = `
      <div class="custom-map-pin ${selectedClass}">
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
          <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 28 12 28C12 28 24 21 24 12C24 5.37 18.63 0 12 0ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="#FFFFFF"/>
          <circle cx="12" cy="12" r="3.5" fill="#5e81b4"/>
        </svg>
      </div>
    `;
  } else if (marker.severity === "moderate") {
    markerHtml = `
      <div class="custom-map-target ${selectedClass}">
        <div class="w-6 h-6 rounded-full border-2 border-white bg-white/30 flex items-center justify-center shadow-lg">
          <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
        </div>
      </div>
    `;
  } else {
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

function createClusterIcon(count: number, maxSeverity: HeatmapSeverity, isSelected: boolean) {
  const selectedClass = isSelected ? " is-selected ring-4 ring-white" : "";
  let badgeColorClass = "bg-[#317cf0] shadow-[0_0_12px_rgba(49,124,240,0.6)]";

  if (maxSeverity === "very-high") {
    badgeColorClass = "bg-[#ff3345] shadow-[0_0_15px_rgba(255,51,69,0.8)]";
  } else if (maxSeverity === "high") {
    badgeColorClass = "bg-[#ff7900] shadow-[0_0_14px_rgba(255,121,0,0.7)]";
  } else if (maxSeverity === "low") {
    badgeColorClass = "bg-[#14b9aa] shadow-[0_0_10px_rgba(20,185,170,0.5)]";
  }

  const html = `
    <div class="custom-cluster-badge ${badgeColorClass} ${selectedClass} w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white transition-transform duration-200 hover:scale-110">
      ${count}
    </div>
  `;

  return L.divIcon({
    className: "custom-leaflet-cluster-icon",
    html,
    iconAnchor: [16, 16],
    iconSize: [32, 32],
    popupAnchor: [0, -16],
  });
}

function FitMarkers({ markers }: { markers: HeatmapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    if (markers.length === 0) {
      map.setView([22.5, 78.5], 4, { animate: false });
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
      maxZoom: 5,
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
  // Cluster co-located pins (within 0.15 degrees)
  const clusters = useMemo(() => {
    const groups: MarkerClusterGroup[] = [];

    markers.forEach((marker) => {
      let found = false;
      for (const group of groups) {
        const dLat = Math.abs(group.latitude - marker.latitude);
        const dLng = Math.abs(group.longitude - marker.longitude);
        if (dLat < 0.15 && dLng < 0.15) {
          group.markers.push(marker);
          if (severityRank[marker.severity] > severityRank[group.maxSeverity]) {
            group.maxSeverity = marker.severity;
          }
          found = true;
          break;
        }
      }
      if (!found) {
        groups.push({
          clusterId: `cluster-${marker.id}`,
          latitude: marker.latitude,
          longitude: marker.longitude,
          markers: [marker],
          maxSeverity: marker.severity,
        });
      }
    });

    return groups;
  }, [markers]);

  return (
    <MapContainer
      center={[22.5, 78.5]}
      className="heatmap-leaflet-map"
      maxBounds={[
        [-85, -180],
        [85, 180],
      ]}
      maxBoundsViscosity={0.8}
      maxZoom={10}
      minZoom={2}
      scrollWheelZoom
      zoom={4}
      worldCopyJump
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        eventHandlers={{
          tileerror: onTileError,
          tileload: onTileLoad,
        }}
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Official Indian Boundary Line Overlay (enclosing J&K, PoK, Gilgit-Baltistan, Ladakh, and Aksai Chin) */}
      <GeoJSON
        data={indiaBoundaryGeoJSON as any}
        style={{
          color: "#60a5fa",
          weight: 2.2,
          opacity: 0.95,
          dashArray: "4, 6",
          fillColor: "transparent",
          fillOpacity: 0,
        }}
      />

      <FitMarkers markers={markers} />

      {clusters.map((cluster) => {
        const isCluster = cluster.markers.length > 1;
        const primaryMarker = cluster.markers[0];
        const hasSelected = cluster.markers.some((m) => m.id === selectedMarkerId);

        if (!isCluster) {
          const markerTitle = `${primaryMarker.label} · ${getSeverityLabel(primaryMarker.severity)} activity`;
          const icon = createMarkerIcon(primaryMarker, hasSelected);

          return (
            <Marker
              alt={`View ${markerTitle}`}
              eventHandlers={{
                click: () => onSelectMarker(primaryMarker),
              }}
              icon={icon}
              key={primaryMarker.id}
              position={[primaryMarker.latitude, primaryMarker.longitude]}
              title={markerTitle}
            >
              <Popup closeButton>
                <article className="heatmap-popup">
                  <p className="heatmap-popup-kicker text-[#5e81b4]">
                    {primaryMarker.label} · {getSeverityLabel(primaryMarker.severity)} activity
                  </p>
                  <h2 className="heatmap-popup-title">{primaryMarker.news.title}</h2>
                  <p className="heatmap-popup-description">{primaryMarker.news.description}</p>
                  <p className="heatmap-popup-meta">
                    {primaryMarker.news.source} · {primaryMarker.news.date}
                  </p>
                </article>
              </Popup>
            </Marker>
          );
        }

        // Render Co-Located Cluster Marker Badge
        const clusterIcon = createClusterIcon(cluster.markers.length, cluster.maxSeverity, hasSelected);

        return (
          <Marker
            alt={`View ${cluster.markers.length} events at ${primaryMarker.label}`}
            eventHandlers={{
              click: () => onSelectMarker(primaryMarker),
            }}
            icon={clusterIcon}
            key={cluster.clusterId}
            position={[cluster.latitude, cluster.longitude]}
            title={`${cluster.markers.length} news events at ${primaryMarker.label}`}
          >
            <Popup closeButton>
              <article className="heatmap-popup max-h-60 overflow-y-auto">
                <p className="heatmap-popup-kicker text-[#5e81b4] mb-2 font-bold">
                  {cluster.markers.length} News Events at {primaryMarker.label}
                </p>
                <div className="flex flex-col gap-3 divide-y divide-slate-700">
                  {cluster.markers.map((m) => (
                    <div
                      key={m.id}
                      className="pt-2 cursor-pointer hover:text-blue-300"
                      onClick={() => onSelectMarker(m)}
                    >
                      <span className="text-xs font-semibold text-[#8176ff]">
                        [{getSeverityLabel(m.severity)}]
                      </span>
                      <h3 className="text-sm font-semibold text-white mt-0.5">{m.news.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{m.news.description}</p>
                    </div>
                  ))}
                </div>
              </article>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
