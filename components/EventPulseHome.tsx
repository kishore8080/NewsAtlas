"use client";

import { Globe2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import HelpButton from "@/components/HelpButton";

export default function EventPulseHome() {
  const router = useRouter();

  return (
    <main className="event-screen flex flex-col items-center overflow-hidden">
      <section
        aria-label="Event pulse"
        className="event-pulse-content flex flex-col items-center text-center"
      >
        <div aria-hidden="true" className="event-globe-decoration">
          <Globe2 size={56} strokeWidth={1.8} />
        </div>

        <button
          aria-label="Open global news heatmap"
          className="event-track-button"
          onClick={() => router.push("/current-affairs")}
          title="Open global news heatmap"
          type="button"
        >
          <Zap aria-hidden="true" className="text-event-icon-soft" size={32} strokeWidth={2} />
          <span>What&apos;s happening?</span>
          <span aria-label="New events available" className="event-notification-dot" />
        </button>

        <p className="event-subtitle">Track global events relevant to UPSC</p>
      </section>

      <HelpButton />
    </main>
  );
}
