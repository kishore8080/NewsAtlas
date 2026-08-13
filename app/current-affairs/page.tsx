"use client";

import { useCallback, useEffect, useState } from "react";
import GlobalNewsHeatmap from "@/components/GlobalNewsHeatmap";
import { apiConfig } from "@/lib/api-config";
import type { NewsItem } from "@/lib/heatmap";

type NewsResponse = {
  news?: NewsItem[];
};

type AffairsMode = "today" | "history";

export default function CurrentAffairs() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AffairsMode>("today");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchNews = useCallback(async (date?: string) => {
    try {
      setLoading(true);
      setError(null);

      let url = apiConfig.endpoints.news;

      if (date) {
        const [year, month, day] = date.split("-");
        url += `?date=${day}-${month}-${year}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = (await response.json()) as NewsResponse;
      setNews(data.news ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNews(mode === "history" ? selectedDate : undefined);
  }, [fetchNews, mode, selectedDate]);

  return (
    <GlobalNewsHeatmap
      error={error}
      loading={loading}
      mode={mode}
      news={news}
      onDateChange={setSelectedDate}
      onModeChange={setMode}
      onRetry={() => void fetchNews(mode === "history" ? selectedDate : undefined)}
      selectedDate={selectedDate}
    />
  );
}
