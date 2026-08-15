"use client";

import { Globe2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import HelpButton from "@/components/HelpButton";
import { trackEvents } from "@/lib/api-hooks";
import { EventTrackingPayload } from "@/lib/api-config";

export default function EventPulseHome() {
  const router = useRouter();
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [trackingMessages, setTrackingMessages] = useState<string[]>([]);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTrackClick = async () => {
    try {
      const payload: EventTrackingPayload = {
        event: isTracking ? "stop_tracking" : "track_global_events",
        timestamp: new Date().toISOString(),
        isTracking: !isTracking
      };

      setIsTracking(!isTracking);
      const result = await trackEvents(payload);

      setTrackingMessages((prev) => [
        ...prev,
        `${result.success ? 'Successfully' : 'Failed to'} ${payload.event}`
      ].slice(-5));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(message);
      setErrorModalOpen(true);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setErrorModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <main className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-[#020710] font-[Inter,ui-sans-serif,system-ui,sans-serif] text-white antialiased">
        <section aria-label="Event pulse" className="flex w-full min-w-0 flex-col items-center px-6 pt-[clamp(160px,32vh,288px)] text-center">
          <button
            onClick={() => router.push('/current-affairs')}
            aria-label="Open global events"
            className="group flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-full border border-[#34445c] bg-[#1d2a3d] shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition duration-200 hover:border-[#667594] hover:bg-[#24334a] active:scale-95"
            title="Open global events heatmap"
            type="button"
          >
            <Globe2 aria-hidden="true" size={56} strokeWidth={1.8} className="text-[#8176ff]" />
          </button>

          <button
            onClick={handleTrackClick}
            aria-label={isTracking ? 'Stop tracking global events' : 'Track global events'}
            className={`relative mt-12 flex h-[90px] w-[380px] max-w-[calc(100vw-48px)] items-center justify-center gap-4 rounded-[22px] px-8 text-[26px] font-semibold tracking-[-0.02em] text-white shadow-[0_18px_30px_rgba(71,49,255,0.25)] transition duration-200 hover:shadow-[0_20px_38px_rgba(71,49,255,0.34)] active:translate-y-px active:shadow-[0_10px_18px_rgba(71,49,255,0.22)] ${
              isTracking ? 'bg-[#3f2be1]' : 'bg-[#4b35ff] hover:bg-[#5945ff]'
            }`}
            id="track-button"
            title={isTracking ? 'Stop tracking global events' : 'Track global events'}
            type="button"
          >
            <Zap aria-hidden="true" size={32} className="shrink-0 text-[#b9b1ff]" strokeWidth={2} />
            <span id="track-label">{isTracking ? 'Tracking…' : "What's happening?"}</span>
            <span
              aria-label="New events available"
              className={`absolute -right-[6px] -top-[6px] h-[18px] w-[18px] rounded-full bg-[#ff3045] shadow-[0_0_0_2px_#020710] ${
                isTracking ? 'animate-pulse' : ''
              }`}
            />
          </button>

          {trackingMessages.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2">
              {trackingMessages.slice(-3).map((msg, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1d2a3d]/70 text-[#8176ff] border border-[#34445c] backdrop-blur-sm shadow-sm"
                >
                  {msg}
                </div>
              ))}
            </div>
          )}

          <p className="mt-[50px] max-w-full text-[20px] font-normal leading-7 tracking-[-0.01em] text-[#4b5d79]">
            Track global events relevant to UPSC
          </p>
        </section>

        <HelpButton label="Open help" />
      </main>

      {errorModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setErrorModalOpen(false)}
        >
          <div
            className="relative bg-[#091224]/95 backdrop-blur-md border border-[#263650]
            rounded-xl w-[340px] sm:w-[400px] max-w-[90vw] p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-[#ff3045] rounded-full flex items-center justify-center text-2xl">
                ⚠️
              </div>
            </div>

            <h2 className="text-white text-xl font-semibold mb-3">
              Connection Error
            </h2>

            <p className="text-[#aab6ca] text-sm mb-4">
              {errorMessage}
            </p>

            <button
              onClick={() => setErrorModalOpen(false)}
              className="w-full py-3 rounded-lg bg-[#4b35ff] hover:bg-[#5945ff]
                text-white font-medium transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
