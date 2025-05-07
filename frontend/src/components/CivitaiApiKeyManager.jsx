import { useState, useEffect } from "react";

export default function CivitaiApiKeyManager({ onChange }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("civitai_api_key") || "");

  useEffect(() => {
    onChange?.(apiKey); // nur wenn onChange existiert
  }, [apiKey]);

  const handleSave = () => {
    localStorage.setItem("civitai_api_key", apiKey);
    alert("✅ API-Key gespeichert.");
  };

  const handleDelete = () => {
    localStorage.removeItem("civitai_api_key");
    setApiKey("");
    alert("🗑️ API-Key gelöscht.");
  };

  return (
    <div className="space-y-2">
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="sk-..."
        className="w-full bg-background border border-box rounded px-3 py-2 text-sm text-white"
      />

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-1 bg-primary text-[#212226] rounded hover:bg-[#d6e955] text-sm"
        >
          Speichern
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-1 border border-red-400 text-red-300 rounded hover:bg-red-600 hover:text-white text-sm"
        >
          Löschen
        </button>
      </div>
    </div>
  );
}
