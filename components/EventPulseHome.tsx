"use client";

import { Globe2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import HelpButton from "@/components/HelpButton";

export default function EventPulseHome() {
  const router = useRouter();
  const [isTracking, setIsTracking] = useState(false);

  return (
    <main className="event-screen flex flex-col items-center overflow-hidden">
      <section
        aria-label="Event pulse"
        className="event-pulse-content flex flex-col items-center text-center"
      >
        <button
          aria-label="Open global events"
          className="event-globe-button group"
          onClick={() => router.push("/current-affairs")}
          title="Open global events"
          type="button"
        >
          <Globe2
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:scale-105"
            size={56}
            strokeWidth={1.8}
          />
        </button>

        <button
          aria-label={isTracking ? "Tracking global events" : "Track global events"}
          className={`event-track-button ${isTracking ? "is-tracking" : ""}`}
          onClick={() => setIsTracking((current) => !current)}
          title="Track global events"
          type="button"
        >
          <Zap aria-hidden="true" className="text-event-icon-soft" size={32} strokeWidth={2} />
          <span aria-live="polite">{isTracking ? "Tracking…" : "What's happening?"}</span>
          <span aria-label="New events available" className="event-notification-dot" />
        </button>

        <p className="event-subtitle">Track global events relevant to UPSC</p>
      </section>

      <HelpButton />
    </main>
  );
}
