'use client';
import { useState } from "react";

export default function Home() {
  const [apiKey, setApiKey] = useState(() => { if (typeof window !== "undefined") { const saved = localStorage.getItem("apiKey"); return saved ?? ""; } return ""; });
  const [trackingNumber, setTrackingNumber] = useState("");
  const [info, setInfo] = useState("");
  const [location, setLocation] = useState("");
  const [delivered, setDelivered] = useState(false); // "true" | "false"
  const [msg, setMessage] = useState<{ info: string } | null>(null);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    localStorage.setItem("apiKey", apiKey)
    console.info("api key saved for next time")

    try {
      const res = await fetch(`/api/pkg/${trackingNumber}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          info,
          location
        }),
      });

      // Safely parse JSON or fall back to empty object
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        return setMessage({ info: `Failed to update package history: ${body.err || "unknown error"}` });
      }

      setMessage({ info: "Updated package history successfully" });

      if (delivered === true) {
        const patchRes = await fetch(`/api/pkg/${trackingNumber}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey,
            delivered
          }),
        });

        if (!patchRes.ok) {
          return setMessage({ info: "Failed to update delivery status" });
        }
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-sans)] overflow-auto p-6">
      <div className="bg-[var(--color-background)] p-8 rounded-lg shadow-xl w-full max-w-screen-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">haystack tracking | updating package history</h1>


        {/* message */}
        {msg && (
          <div className="mt-1 space-y-3 pb-4">
            <div className="bg-gray-700 p-5 shadow-md border border-gray-600">
              <p className="text-gray-200 font-medium">
                <strong>Info</strong>: {msg.info}
              </p>
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">

          <div className="w-full">
            <p className="pt-1">Super Secret API Key</p>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key"
              className="w-full p-2 border border-gray-700 bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-full">
            <p className="pt-1">Tracking Number</p>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number to modify"
              className="w-full p-2 border border-gray-700 bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-full">
            <div className="flex items-baseline gap-2 pt-1">
              <p>Info</p>
            </div>
            <input
              type="text"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="Package log title"
              className="w-full p-2 border border-gray-700 bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-full">
            <div className="flex items-baseline gap-2 pt-1">
              <p>Location</p>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Package location"
              className="w-full p-2 border border-gray-700 bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


          <div className="w-full">
            <label className="flex items-center gap-3 pt-1  bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={delivered}
                onChange={(e) => setDelivered(e.target.checked)}
                className="accent-blue-500 w-5 h-5"
              />
              <span>Has this package been delivered? (this will prevent future history changes)</span>
            </label>
          </div>

          <button
            type="submit"
            className="px-6 bg-gray-500 text-white font-semibold hover:bg-gray-600">
            Update package details
          </button>
        </form>

      </div>
    </div>
  );
}
