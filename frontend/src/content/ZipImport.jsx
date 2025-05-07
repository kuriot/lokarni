import { useState } from "react";
import axios from "axios";

export default function ZipImport() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setStatus("Wird hochgeladen...");
    setProgress(0);

    try {
      await axios.post("http://localhost:8000/api/assets/import/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      setStatus("Import erfolgreich ✅");
    } catch (err) {
      setStatus("Fehler beim Import ❌");
      console.error(err);
    }
  };

  return (
    <div className="bg-zinc-900 p-4 rounded shadow max-w-md mx-auto">
      <h2 className="text-white text-lg mb-2">ZIP-Import</h2>
      <input
        type="file"
        accept=".zip"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-3 block w-full text-sm"
      />
      <button
        onClick={handleUpload}
        disabled={!file}
        className="bg-primary text-black px-4 py-2 rounded hover:bg-opacity-80"
      >
        Import starten
      </button>

      {progress > 0 && (
        <div className="mt-4 bg-zinc-800 h-3 rounded">
          <div
            className="bg-green-500 h-3 rounded transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {status && <p className="mt-2 text-sm text-white">{status}</p>}
    </div>
  );
}
