'use client';
import { useEffect, useState } from "react";

type TrackingHistory = {
  info: string;
  location: string;
  time: string;
};

type TrackingResponse = {
  id: string;
  sender: string;
  receiver: string;
  express: boolean;
  signature: boolean;
  abandon: boolean;
  delivered: boolean;
  country_code: string;
  history: TrackingHistory[];
};

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingResponse | null>(null);
  const [error, setError] = useState<{ msg: string } | null>(null);

  const handleTrack = async () => {
    try {
      setError(null);
      setTrackingData(null);
      const res = await fetch(`/api/pkg/${trackingNumber}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.err);
      setTrackingData(data);
    } catch (err) {
      setError({ msg: `${err || "unknown error"}` });
      console.error(err);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-sans)] overflow-auto p-6">
      <div className="bg-[var(--color-background)] p-8 rounded-lg shadow-xl w-full max-w-screen-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">haystack tracking</h1>

        {/* Input */}
        <div className="flex justify-center gap-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="w-full p-2 border border-gray-700 bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="px-6 bg-gray-500 text-white font-semibold hover:bg-gray-600"
            onClick={handleTrack}
          >
            Track
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-1 space-y-3">
            <div className="bg-gray-700 p-5 shadow-md border border-gray-600">
              <p className="text-gray-200 font-medium">
                <strong>Error</strong>: Consignment ID invalid or server returned invalid response. ({error.msg})
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {trackingData && (
          <div className="mt-4">
            <div className="flex gap-1">
              <div className="h-2 w-1/1 bg-yellow-500" />
            </div>
          </div>
        )}

        {/* Tracking Status */}
        <div className="mt-1 space-y-3">
          {trackingData && trackingData.history.length > 0 && (
            <div className="bg-gray-700 p-5 shadow-md border border-gray-600">
              <p className="text-gray-200 font-medium">
                <strong>Enroute</strong>: {trackingData.history[trackingData.history.length - 1].info}
              </p>
            </div>
          )}

          {/* Timeline */}
          {trackingData?.history && [...trackingData.history].reverse().map((event, index, arr) => {
            const isLast = index === 0; // because we reversed the history
            const symbol = isLast && trackingData.delivered ? '✓' : '▲';

            return (
              <div key={index} className="relative pl-6 pb-3">
                <span className="absolute left-0 top-1 text-gray-400">{symbol}</span>
                <p className="font-medium">{event.info}</p>
                <p className="text-sm text-gray-400">{event.location}</p>
              </div>
            );
          })}



        </div>
      </div>
    </div>
  );
}
