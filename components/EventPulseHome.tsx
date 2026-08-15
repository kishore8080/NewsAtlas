"use client";

import { Globe2, Zap } from "lucide-react";
import { useRouter, useState, useEffect } from "react";
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

      setTrackingMessages([
        ...trackingMessages,
        `${result.success ? 'Successfully' : 'Failed to'} ${payload.event}`
      ]);

      setTrackingMessages(trackingMessages.slice(-5)); // Keep last 5 messages
    } catch (error) {
      setErrorMessage(error.message || 'Unknown error occurred');
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
      <main className="relative min-h-screen w-full overflow-hidden bg-[#020710] font-[Inter,ui-sans-serif,system-ui,sans-serif] text-white">
        <section className="flex w-full min-w-0 flex-col items-center px-4 pt-[160px] md:pt-[200px] lg:pt-[280px] text-center">
          <div className="mb-6">
            <div className="relative">
              <Globe2 size={56} strokeWidth={1.8} className="md:size-[80px] lg:size-[96px]" />
              {isTracking && (
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#ff3045] rounded-full animate-pulse" />
              )}
            </div>
          </div>

          <button
            onClick={handleTrackClick}
            className={`group flex h-[90px] w-[380px] max-w-[calc(100vw-48px)]
              shrink-0 rounded-[22px] border border-[#34445c]
              bg-[#1d2a3d] shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-all duration-200
              hover:border-[#667594] hover:bg-[#24334a] active:scale-95
              ${isTracking ? 'bg-[#3f2be1] border-[#667594]' : ''}`}
            aria-label={isTracking ? 'Stop tracking global events' : 'Open Global Events'}
            title={isTracking ? 'Stop tracking global events' : 'Open Global Events'}
            type="button"
          >
            <Zap
              aria-hidden="true"
              size={32}
              className="text-[#8176ff] transition-transform duration-300"
              strokeWidth={2}
            />
            <span className="sr-only">{isTracking ? 'Stop tracking global events' : 'Open Global Events'}</span>
          </button>

          {trackingMessages.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2">
              {trackingMessages.slice(-3).map((msg, i) => (
                <div
                  key={i}
                  className="px-3 py-1 rounded text-sm bg-[#1d2a3d/50] text-[#8176ff] backdrop-blur-sm"
                >
                  {msg}
                </div>
              ))}
            </div>
          )}

          <p className="mt-[50px] max-w-full text-[20px] font-normal leading-7
            tracking-[-0.01em] text-[#4b5d79] md:text-[20px] lg:text-[22px]">
            Track global events relevant to UPSC
          </p>
        </section>

        <HelpButton
          className="fixed bottom-5 right-5 z-50 hover:shadow-md transition-all duration-200"
          label="Open help"
        />
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
