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
}

export interface HeatmapMarker {
  id: string;
  label: string;
  severity: HeatmapSeverity;
  left: string;
  top: string;
  newsIndex?: number;
}

export interface HeatmapLegendItem {
  severity: HeatmapSeverity;
  label: string;
  dotClassName: string;
}

export const heatmapLegend: HeatmapLegendItem[] = [
  { severity: "very-high", label: "Very High", dotClassName: "heatmap-legend-dot-very-high" },
  { severity: "high", label: "High", dotClassName: "heatmap-legend-dot-high" },
  { severity: "moderate", label: "Moderate", dotClassName: "heatmap-legend-dot-moderate" },
  { severity: "low", label: "Low", dotClassName: "heatmap-legend-dot-low" },
];

export const heatmapMarkers: HeatmapMarker[] = [
  {
    id: "arctic-ocean",
    label: "Arctic Ocean",
    severity: "moderate",
    left: "44.9%",
    top: "19%",
    newsIndex: 0,
  },
  {
    id: "europe",
    label: "Europe",
    severity: "high",
    left: "56.5%",
    top: "29.9%",
    newsIndex: 1,
  },
  {
    id: "asia",
    label: "Asia",
    severity: "very-high",
    left: "71.3%",
    top: "38%",
    newsIndex: 2,
  },
  {
    id: "east-asia",
    label: "East Asia",
    severity: "high",
    left: "95.9%",
    top: "24%",
    newsIndex: 3,
  },
  {
    id: "south-atlantic",
    label: "South Atlantic",
    severity: "low",
    left: "43.4%",
    top: "53.9%",
    newsIndex: 4,
  },
  {
    id: "south-america",
    label: "South America",
    severity: "moderate",
    left: "12.1%",
    top: "62.9%",
    newsIndex: 5,
  },
  {
    id: "australia",
    label: "Australia",
    severity: "low",
    left: "97.6%",
    top: "65%",
    newsIndex: 6,
  },
];

export function getSeverityLabel(severity: HeatmapSeverity) {
  return heatmapLegend.find((item) => item.severity === severity)?.label ?? "Unknown";
}
