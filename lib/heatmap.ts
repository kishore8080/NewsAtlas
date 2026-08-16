export type HeatmapSeverity = "very-high" | "high" | "moderate" | "low";

export type NewsImportance = "High" | "Medium" | "Low";

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  date: string;
  source: string;
  relevance: string[];
  key_points?: string[];
  importance?: NewsImportance;
  latitude?: number;
  longitude?: number;
}

export interface HeatmapMarker {
  id: string;
  label: string;
  severity: HeatmapSeverity;
  latitude: number;
  longitude: number;
  news: NewsItem;
}

export interface HeatmapLegendItem {
  severity: HeatmapSeverity;
  label: string;
  dotClassName: string;
}

export const heatmapLegend: HeatmapLegendItem[] = [
  { severity: "very-high", label: "Happening News", dotClassName: "heatmap-legend-dot-very-high" },
  { severity: "high", label: "Important News", dotClassName: "heatmap-legend-dot-high" },
  { severity: "moderate", label: "Good to Know", dotClassName: "heatmap-legend-dot-moderate" },
  { severity: "low", label: "Low Priority", dotClassName: "heatmap-legend-dot-low" },
];

type RegionSlot = {
  label: string;
  latitude: number;
  longitude: number;
  keywords: string[];
};

const regionSlots: RegionSlot[] = [
  {
    label: "South Asia",
    latitude: 22.5,
    longitude: 78,
    keywords: ["polity", "governance", "india", "social", "history"],
  },
  {
    label: "East Asia",
    latitude: 35,
    longitude: 116,
    keywords: ["economy", "banking", "trade", "finance"],
  },
  {
    label: "Europe",
    latitude: 50,
    longitude: 15,
    keywords: ["science", "technology", "digital", "innovation"],
  },
  {
    label: "Africa",
    latitude: 4,
    longitude: 20,
    keywords: ["environment", "climate", "renewable", "agriculture"],
  },
  {
    label: "North America",
    latitude: 39,
    longitude: -102,
    keywords: ["international", "defense", "security", "diplomacy"],
  },
  {
    label: "South America",
    latitude: -15,
    longitude: -60,
    keywords: ["health", "education", "development"],
  },
  {
    label: "Oceania",
    latitude: -25,
    longitude: 135,
    keywords: ["pacific", "maritime", "ocean"],
  },
];

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getRegionSlot(newsItem: NewsItem, index: number) {
  const searchableText = [newsItem.category, ...newsItem.relevance].join(" ").toLowerCase();
  const matchedSlot = regionSlots.find((slot) =>
    slot.keywords.some((keyword) => searchableText.includes(keyword)),
  );

  return matchedSlot ?? regionSlots[index % regionSlots.length];
}

function getSeverity(importance?: NewsImportance): HeatmapSeverity {
  if (importance === "High") return "very-high";
  if (importance === "Medium") return "high";
  if (importance === "Low") return "low";
  return "moderate";
}

export function createHeatmapMarkers(news: NewsItem[]): HeatmapMarker[] {
  return news.map((newsItem, index) => {
    const slot = getRegionSlot(newsItem, index);
    const hash = stableHash(`${newsItem.id}:${newsItem.title}:${index}`);
    const latitudeJitter = ((hash % 9) - 4) * 0.7;
    const longitudeJitter = ((((hash >>> 4) % 13) - 6) * 1.1);

    return {
      id: newsItem.id || `news-${index}`,
      label: slot.label,
      severity: getSeverity(newsItem.importance),
      latitude: clamp(newsItem.latitude ?? slot.latitude + latitudeJitter, -80, 80),
      longitude: clamp(newsItem.longitude ?? slot.longitude + longitudeJitter, -180, 180),
      news: newsItem,
    };
  });
}

export function getSeverityLabel(severity: HeatmapSeverity) {
  return heatmapLegend.find((item) => item.severity === severity)?.label ?? "Unknown";
}
