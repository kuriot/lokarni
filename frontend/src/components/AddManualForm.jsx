import { useState, useEffect } from "react";

export default function AddManualForm({ onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    trigger_words: "",
    positive_prompt: "",
    negative_prompt: "",
    tags: "",
    model_version: "",
    used_resources: "",
    slug: "",
    creator: "",
    base_model: "",
    created_at: "",
    nsfw_level: "",
    download_url: "",
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [urlInputs, setUrlInputs] = useState(["", "", "", ""]);

  useEffect(() => {
    const urls = mediaFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [mediaFiles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaUpload = (e) => {
    setMediaFiles([...e.target.files]);
  };

  const handleUrlInputChange = (index, value) => {
    setUrlInputs((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let media_files = [];
    let preview_image_path = "";

    // Lokale Datei-Uploads
    for (let i = 0; i < mediaFiles.length; i++) {
      const mediaData = new FormData();
      mediaData.append("file", mediaFiles[i]);
      mediaData.append("type", formData.type);

      const uploadRes = await fetch("http://localhost:8000/api/upload-image", {
        method: "POST",
        body: mediaData,
      });

      if (uploadRes.ok) {
        const result = await uploadRes.json();
        media_files.push(result.path);
        if (!preview_image_path) preview_image_path = result.path;
      } else {
        console.error("Datei konnte nicht hochgeladen werden.");
        return;
      }
    }

    // URL-Uploads
    for (let i = 0; i < urlInputs.length; i++) {
      const url = urlInputs[i].trim();
      if (url) {
        const urlRes = await fetch("http://localhost:8000/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, type: formData.type }),
        });

        if (urlRes.ok) {
          const result = await urlRes.json();
          media_files.push(result.path);
          if (!preview_image_path) preview_image_path = result.path;
        } else {
          console.error(`Fehler beim Hochladen der URL: ${url}`);
          return;
        }
      }
    }

    const payload = {
      ...formData,
      preview_image: preview_image_path,
      media_files,
      path: `/models/${formData.type}/${formData.name.replace(/\s+/g, "_").toLowerCase()}.ckpt`,
    };

    const response = await fetch("http://localhost:8000/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const asset = await response.json();
      if (onSave) onSave(asset);
      setFormData({
        name: "",
        type: "",
        description: "",
        trigger_words: "",
        positive_prompt: "",
        negative_prompt: "",
        tags: "",
        model_version: "",
        used_resources: "",
        slug: "",
        creator: "",
        base_model: "",
        created_at: "",
        nsfw_level: "",
        download_url: "",
      });
      setMediaFiles([]);
      setPreviewUrls([]);
      setUrlInputs(["", "", "", ""]);
    } else {
      console.error("Fehler beim Speichern");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Medienbereich */}
      <div className="rounded border border-box p-6 bg-zinc-900 space-y-6">
        <h3 className="text-primary font-semibold text-lg">Medien hinzufügen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lokaler Upload */}
          <div>
            <label className="block text-sm text-white font-semibold mb-2">Dateien (Bilder/Videos)</label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {previewUrls.map((url, idx) =>
                mediaFiles[idx]?.type?.startsWith("video/") ? (
                  <video key={idx} src={url} controls className="w-full rounded border border-box" />
                ) : (
                  <img key={idx} src={url} alt="Preview" className="w-full rounded border border-box" />
                )
              )}
            </div>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaUpload}
              className="w-full text-sm text-white file:bg-primary file:text-black file:font-semibold file:border-none file:px-4 file:py-2 file:rounded"
            />
          </div>

          {/* URL-Felder */}
          <div>
            <label className="block text-sm text-white font-semibold mb-2">Medien-URLs (max. 4)</label>
            <div className="space-y-2">
              {urlInputs.map((url, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`https://example.com/media-${index + 1}.jpg`}
                  value={url}
                  onChange={(e) => handleUrlInputChange(index, e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white text-sm placeholder:text-zinc-500"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulareingaben */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(formData).map((field) => (
          <div key={field} className="space-y-1">
            <label className="block text-sm font-semibold text-primary capitalize">
              {field.replace("_", " ")}
            </label>
            <textarea
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="w-full bg-background border border-box rounded p-2 text-white text-sm resize-none min-h-[40px]"
            />
          </div>
        ))}
      </div>

      {/* Speichern */}
      <button
        type="submit"
        className="px-6 py-2 bg-primary text-background rounded hover:bg-yellow-400 font-semibold"
      >
        Speichern
      </button>
    </form>
  );
}
