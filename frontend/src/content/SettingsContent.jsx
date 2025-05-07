import { useState, useEffect } from "react";

export default function SettingsContent() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("civitaiApiKey");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = async () => {
    if (!apiKey) return;

    try {
      const res = await fetch("http://localhost:8000/api/test-api-key", {
        headers: {
          "X-Civitai-Api-Key": apiKey,
        },
      });

      if (res.ok) {
        localStorage.setItem("civitaiApiKey", apiKey);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Verbindung fehlgeschlagen:", err);
      setStatus("error");
    }
  };

  return (
    <div className="bg-[#2a2b2e] p-6 rounded-lg shadow-md mb-6 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-white">🌐 CivitAI API-Key</h2>

      <input
        type="text"
        placeholder="Hier API-Key eingeben..."
        value={apiKey}
        onChange={(e) => {
          setApiKey(e.target.value);
          setStatus(null);
        }}
        className="w-full p-2 mb-4 rounded bg-[#1f2023] border border-box text-white"
      />

      <button
        onClick={handleSave}
        className="bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-4 rounded"
      >
        Speichern & Testen
      </button>

      {status === "success" && (
        <p className="text-green-400 mt-3">✅ API-Key gespeichert und gültig.</p>
      )}
      {status === "error" && (
        <p className="text-red-400 mt-3">❌ API-Key ungültig oder Verbindung fehlgeschlagen.</p>
      )}
    </div>
  );
}
