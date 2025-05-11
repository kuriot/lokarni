import { useState, useEffect } from "react";
import axios from "axios";

export default function AddFromCivitai() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("civitai-api-key");
    if (stored) setApiKey(stored);
  }, []);

  const handleImport = async () => {
    setMessage("");

    const headers = {
      "User-Agent": "Lokarni-Frontend/1.0",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const isImageUrl = url.includes("/images/");

    try {
      let endpoint;
      let payload;

      if (isImageUrl) {
        const imageId = url.split("/images/")[1].split("?")[0];
        endpoint = `/api/import/from-civitai-image/${imageId}`;
        payload = {};
      } else {
        endpoint = "/api/assets/from-civitai";
        payload = { civitai_url: url, api_key: apiKey || null };
      }

      const res = await axios.post(endpoint, payload, { headers });

      if (apiKey) {
        localStorage.setItem("civitai-api-key", apiKey);
        document.cookie = `civitai-api-key=${apiKey};path=/`;
      }

      setMessage(`✅ Successfully imported: ${res.data.name}`);
    } catch (err) {
      setMessage(
        `❌ Error: ${err.response?.data?.detail || err.message || "Unknown error"}`
      );
    }
  };

  return (
    <div className="space-y-10">
      {/* Import field */}
      <div className="bg-box p-6 rounded-md shadow-md space-y-4">
        <h2 className="text-lg font-bold">Import from CivitAI</h2>

        <input
          type="text"
          placeholder="CivitAI model - https://civitai.com/models/1234567"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 rounded bg-zinc-900 text-white border border-zinc-700"
        />

        {/* Note: What does NOT work */}
        <div className="text-xs text-yellow-400 italic">
          ⚠️ Slugs like <code>/models/sdxl</code> or image links <code>/images/xyz</code> are not supported – please use the complete model URL with ID.
        </div>

        <input
          type="text"
          placeholder="Optional: CivitAI API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 rounded bg-zinc-900 text-white border border-zinc-700"
        />

        <div className="text-xs text-zinc-400">
          🔑 You can create an API key at{" "}
          <a
            href="https://civitai.com/user/account"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            civitai.com/account
          </a>{" "}
          and paste it here – required for NSFW content.
        </div>

        <button
          onClick={handleImport}
          className="bg-primary text-background font-semibold px-4 py-2 rounded hover:bg-opacity-90 transition"
        >
          Import
        </button>

        {message && (
          <p className={`text-sm mt-2 ${message.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>

      {/* Metadata table */}
      <div className="bg-background p-6 rounded-md border border-box shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Available Metadata from CivitAI</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-400 uppercase text-xs">
                <th className="px-3 py-2">Field</th>
                <th className="px-3 py-2">API Source</th>
                <th className="px-3 py-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {[
                ["name", "model_data.name", "Name of the model"],
                ["type", "model_data.type", "Model type (Checkpoint, LoRA, etc.)"],
                ["description", "model_data.description", "Model description"],
                ["model_version", "version.name", "Version name"],
                ["trigger_words", "version.trainedWords[]", "Trained trigger words"],
                ["preview_image", "images[0].url", "Preview image URL"],
                ["positive_prompt", "images[0].meta.prompt", "Positive prompt"],
                ["negative_prompt", "images[0].meta.negativePrompt", "Negative prompt"],
                ["tags", "model_data.tags[]", "Tags"],
                ["used_resources", "images[0].resources[]", "Used resources"],
                ["slug", "model_data.slug", "Slug (speaking URL part)"],
                ["creator", "model_data.creator.username", "Creator of the model"],
                ["nsfw", "model_data.nsfw", "NSFW level"],
                ["base_model", "version.baseModel", "Base model (e.g. SDXL)"],
                ["created_at", "version.createdAt", "Creation date"],
                ["download_url", "version.files[0].downloadUrl", "Download link of the model"],
              ].map(([field, source, desc]) => (
                <tr key={field}>
                  <td className="px-3 py-2 font-mono text-primary">{field}</td>
                  <td className="px-3 py-2 text-zinc-400">{source}</td>
                  <td className="px-3 py-2">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}