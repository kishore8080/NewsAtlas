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
  const selectedClass = isSelected ? " is-selected ring-4 ring-white/90 scale-125" : "";
  let markerHtml = "";
  let size: [number, number] = [28, 28];
  let anchor: [number, number] = [14, 14];

  if (marker.severity === "very-high") {
    // Bigger Red Circle - Happening News
    size = [42, 42];
    anchor = [21, 21];
    markerHtml = `
      <div class="relative flex items-center justify-center w-10 h-10 ${selectedClass}">
        <span class="absolute inline-flex h-full w-full rounded-full bg-red-500/40 animate-ping"></span>
        <div class="relative w-9 h-9 rounded-full bg-red-500/75 border-2 border-white flex items-center justify-center shadow-[0_0_16px_rgba(239,68,68,0.85)] transition-transform duration-200 hover:scale-110">
          <div class="w-3.5 h-3.5 rounded-full bg-white shadow-inner"></div>
        </div>
      </div>
    `;
  } else if (marker.severity === "high") {
    // Medium Red Circle - Important News
    size = [30, 30];
    anchor = [15, 15];
    markerHtml = `
      <div class="relative flex items-center justify-center w-7 h-7 ${selectedClass}">
        <div class="w-7 h-7 rounded-full bg-red-500/75 border-2 border-white/90 shadow-[0_0_12px_rgba(239,68,68,0.7)] flex items-center justify-center transition-transform duration-200 hover:scale-110">
          <div class="w-2.5 h-2.5 rounded-full bg-white/90"></div>
        </div>
      </div>
    `;
  } else if (marker.severity === "moderate") {
    // Medium-Light Red Circle - Good to Know News
    size = [22, 22];
    anchor = [11, 11];
    markerHtml = `
      <div class="relative flex items-center justify-center w-5.5 h-5.5 ${selectedClass}">
        <div class="w-5.5 h-5.5 rounded-full bg-rose-400/75 border-2 border-white/80 shadow-[0_0_8px_rgba(244,63,94,0.5)] transition-transform duration-200 hover:scale-110"></div>
      </div>
    `;
  } else {
    // Red Dot - Low Priority News
    size = [14, 14];
    anchor = [7, 7];
    markerHtml = `
      <div class="relative flex items-center justify-center w-3.5 h-3.5 ${selectedClass}">
        <div class="w-3.5 h-3.5 rounded-full bg-red-500 border border-white/90 shadow-md transition-transform duration-200 hover:scale-125"></div>
      </div>
    `;
  }

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: markerHtml,
    iconAnchor: anchor,
    iconSize: size,
    popupAnchor: [0, -anchor[1]],
  });
}

function createClusterIcon(count: number, maxSeverity: HeatmapSeverity, isSelected: boolean) {
  const selectedClass = isSelected ? " is-selected ring-4 ring-white scale-125" : "";
  let bgClass = "bg-red-500/85 shadow-[0_0_14px_rgba(239,68,68,0.7)]";

  if (maxSeverity === "very-high") {
    bgClass = "bg-red-600/90 shadow-[0_0_18px_rgba(220,38,38,0.85)] animate-pulse";
  } else if (maxSeverity === "high") {
    bgClass = "bg-red-500/85 shadow-[0_0_14px_rgba(239,68,68,0.75)]";
  } else if (maxSeverity === "low") {
    bgClass = "bg-rose-500/75 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
  }

  const html = `
    <div class="custom-cluster-badge ${bgClass} ${selectedClass} w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-extrabold text-white transition-transform duration-200 hover:scale-110">
      ${count}
    </div>
  `;

  return L.divIcon({
    className: "custom-leaflet-cluster-icon",
    html,
    iconAnchor: [18, 18],
    iconSize: [36, 36],
    popupAnchor: [0, -18],
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
