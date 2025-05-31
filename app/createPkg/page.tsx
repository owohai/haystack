'use client';
import { useState } from "react";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [history_location, setHistoryLocation] = useState("");
  const [express, setExpress] = useState(false);
  const [signature, setSignature] = useState(false);
  const [abandon, setAbandon] = useState(false);
  const [msg, setMessage] = useState<{ info: string, trackingNo: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!history_location) {
      setMessage({ info: `Failed to create package: no history location`, trackingNo: "" });
      return;
    }

    let trackingNumber = "";

    try {
      const res = await fetch('/api/pkg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          sender,
          receiver,
          express,
          signature,
          abandon
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || !body.id) {
        setMessage({ info: `Failed to create package: ${body.err || "unknown error or API key is invalid"}`, trackingNo: "" });
        return;
      }

      trackingNumber = body.id;
      setMessage({ info: `Package created. Tracking number is ${trackingNumber}`, trackingNo: trackingNumber });

    } catch (err) {
      console.error(err);
      setMessage({ info: `Error: ${String(err)}`, trackingNo: "" });
      return;
    }

    try {
      const res = await fetch(`/api/pkg/${trackingNumber}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          info: "Package Information Registered",
          location: history_location
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage({ info: `Failed to update package history, but tracking number was generated: ${trackingNumber}`, trackingNo: trackingNumber });
      } else {
        console.log("Updated package history successfully");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-sans)] overflow-auto p-6">
      <div className="bg-[var(--color-background)] p-8 rounded-lg shadow-xl w-full max-w-screen-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">haystack | creating package</h1>

        {msg && (
          <div className="mt-1 space-y-3 pb-4">
            <div className="bg-gray-700 p-5 shadow-md border border-gray-600">
              <p className="text-gray-200 font-medium flex items-center gap-2">
                {msg.info}
                {msg.trackingNo && msg.trackingNo.trim() !== "" && (
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.trackingNo)}
                    className="ml-2 text-blue-400 underline hover:text-blue-300"
                  >
                    (copy to clipboard)
                  </button>
                )}
              </p>
            </div>
          </div>
        )}

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
            <p className="pt-1">Sender</p>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Sender details"
              className="w-full p-2 border border-gray-700 bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-full">
            <p className="pt-1">Receiver</p>
            <input
              type="text"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="Receiver details"
              className="w-full p-2 border border-gray-700 bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-full">
            <p className="pt-1">Initial History Location</p>
            <input
              type="text"
              value={history_location}
              onChange={(e) => setHistoryLocation(e.target.value)}
              placeholder="What will appear under the inital history entry"
              className="w-full p-2 border border-gray-700 bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-full">
            <label className="flex items-center gap-3 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={express}
                onChange={(e) => setExpress(e.target.checked)}
                className="accent-blue-500 w-5 h-5"
              />
              <span>(EX) Express designation</span>
            </label>
          </div>

          <div className="w-full">
            <label className="flex items-center gap-3 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={signature}
                onChange={(e) => setSignature(e.target.checked)}
                className="accent-blue-500 w-5 h-5"
              />
              <span>(SG) Signature is required on delivery</span>
            </label>
          </div>

          <div className="w-full">
            <label className="flex items-center gap-3 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={abandon}
                onChange={(e) => setAbandon(e.target.checked)}
                className="accent-blue-500 w-5 h-5"
              />
              <span>(AB) Abandon if delivery not possible</span>
            </label>
          </div>

          <button
            type="submit"
            className="px-6 bg-gray-500 text-white font-semibold hover:bg-gray-600"
          >
            Create Package
          </button>
        </form>
      </div>
    </div>
  );
}
