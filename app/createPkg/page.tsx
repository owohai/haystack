'use client';
import { useState } from "react";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [country_code, setCountryCode] = useState("");
  const [express, setExpress] = useState(false); // "true" | "false"
  const [signature, setSignature] = useState(false); // "true" | "false"
  const [abandon, setAbandon] = useState(false); // "true" | "false"
  const [msg, setMessage] = useState<{ info: string, trackingNo: string } | null>(null);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

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
          country_code,
          express,
          signature,
          abandon
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        return setMessage({ info: `Failed to create package: ${body.err || "unknown error or API key is invalid"}`, trackingNo: "" });
      }

      setMessage({ info: `Package created. Tracking number is ${body.id}`, trackingNo: `${body.id}` })

    } catch (err) {
      setMessage({ info: `${err || "unknown error"}`, trackingNo: "" })
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
            <p className="pt-1">Country Code</p>
            <input
              type="text"
              value={country_code}
              onChange={(e) => setCountryCode(e.target.value)}
              placeholder="2 character long country code"
              className="w-full p-2 border border-gray-700 bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist-mono)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-full">
            <label className="flex items-center gap-3 pt-1  bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist)] cursor-pointer select-none">
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
            <label className="flex items-center gap-3 pt-1  bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist)] cursor-pointer select-none">
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
            <label className="flex items-center gap-3 pt-1  bg-[var(--color-background)] text-[var(--color-foreground)] font-[family-name:var(--font-geist)] cursor-pointer select-none">
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
