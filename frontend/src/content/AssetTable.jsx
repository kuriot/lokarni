import { useEffect, useState } from "react";
import { Trash2, Image as ImageIcon, Pencil, Download, Loader2 } from "lucide-react";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import AssetModal from "../components/AssetModal";

const BASE_URL = "http://localhost:8000";

export default function AssetTable() {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [preview, setPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [editingAsset, setEditingAsset] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState("");

  const itemsPerPage = 20;

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    const res = await axios.get("/api/assets/");
    setAssets(res.data);
    setSelectedAssets([]);
  };

  const deleteAsset = async (id) => {
    await axios.delete(`/api/assets/${id}`);
    loadAssets();
  };

  const deleteSelectedAssets = async () => {
    if (!selectedAssets.length) return;
    if (!window.confirm(`${selectedAssets.length} Assets wirklich löschen?`)) return;
    for (const id of selectedAssets) {
      await axios.delete(`/api/assets/${id}`);
    }
    loadAssets();
  };

  const renameTypeForSelected = async () => {
    if (!selectedAssets.length) return;
    const newType = prompt("Neuer Typ für ausgewählte Assets:");
    if (!newType) return;
    for (const id of selectedAssets) {
      await axios.put(`/api/assets/${id}`, { type: newType });
    }
    loadAssets();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith(".zip")) return alert("Bitte eine gültige ZIP-Datei wählen.");

    const formData = new FormData();
    formData.append("file", file);

    setImportStatus("Import läuft...");
    setImportProgress(0);

    try {
      await axios.post("/api/assets/import/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setImportProgress(percent);
        },
      });

      setImportStatus("Import erfolgreich ✅");
      setTimeout(() => setImportStatus(""), 3000);
      loadAssets();
    } catch (err) {
      console.error(err);
      setImportStatus("Fehler beim Import ❌");
    }
  };

  const uniqueTypes = [...new Set(assets.map((a) => a.type).filter(Boolean))];

  const filteredAssets = assets
    .filter((asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filterType || asset.type === filterType)
    )
    .sort((a, b) => {
      if (sortKey === "media") {
        return sortAsc
          ? (a.media_files?.length || 0) - (b.media_files?.length || 0)
          : (b.media_files?.length || 0) - (a.media_files?.length || 0);
      }
      const aVal = a[sortKey] || "";
      const bVal = b[sortKey] || "";
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const pageCount = Math.ceil(filteredAssets.length / itemsPerPage);
  const pagedAssets = filteredAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const getPreviewUrl = (asset) => {
    if (!asset?.media_files?.length) return null;
    const file = asset.media_files.find((f) =>
      typeof f === "string" && f.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm)$/i)
    );
    return file ? BASE_URL + file : null;
  };

  const isVideo = (url) => url?.match(/\.(mp4|webm)$/i);

  const toggleSelectAll = () => {
    const allIds = pagedAssets.map((a) => a.id);
    const allSelected = allIds.every(id => selectedAssets.includes(id));
    if (allSelected) {
      setSelectedAssets(selectedAssets.filter(id => !allIds.includes(id)));
    } else {
      setSelectedAssets([...new Set([...selectedAssets, ...allIds])]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    const zip = new JSZip();
    const assetsData = [];
    const mediaFolder = zip.folder("media");

    for (const asset of assets) {
      assetsData.push({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        media_files: asset.media_files,
        subcategory: asset.subcategory,
        description: asset.description || "",
      });

      if (Array.isArray(asset.media_files)) {
        for (const file of asset.media_files) {
          if (typeof file === "string") {
            const url = BASE_URL + file;
            try {
              const response = await fetch(url);
              if (!response.ok) continue;
              const blob = await response.blob();
              const filename = file.split("/").pop();
              mediaFolder.file(filename, blob);
            } catch (err) {
              console.warn(`Fehler beim Laden von ${url}`, err);
            }
          }
        }
      }
    }

    zip.file("assets.json", JSON.stringify(assetsData, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "Lokarni_Export.zip");
  };

  return (
    <div className="relative overflow-x-auto pb-32">
      {preview && (
        <div className="fixed top-4 right-4 z-50 bg-black border border-zinc-700 p-2 rounded shadow-lg">
          {isVideo(preview) ? (
            <video src={preview} className="w-48 h-48 object-cover" autoPlay loop muted />
          ) : (
            <img src={preview} alt="Vorschau" className="w-48 h-48 object-cover" />
          )}
        </div>
      )}

      {/* Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <input
          type="text"
          placeholder="Suchen nach Name..."
          className="bg-zinc-800 text-white px-3 py-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="bg-zinc-800 text-white px-3 py-2 rounded"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Alle Typen</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          className="bg-zinc-800 text-white px-3 py-2 rounded"
          value={sortKey}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="name">Sortieren nach Name</option>
          <option value="type">Sortieren nach Typ</option>
          <option value="media">Sortieren nach Medienanzahl</option>
        </select>
      </div>

      {/* Tabelle */}
      <table className="min-w-full bg-zinc-900 border border-zinc-700 text-sm">
        <thead className="text-left text-zinc-400 bg-zinc-800">
          <tr>
            <th className="p-2">
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={pagedAssets.every((a) => selectedAssets.includes(a.id))}
              />
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("name")}>
              Name {sortKey === "name" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("type")}>
              Typ {sortKey === "type" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort("media")}>
              Medien {sortKey === "media" && (sortAsc ? "▲" : "▼")}
            </th>
            <th className="p-2">Aktionen</th>
          </tr>
        </thead>
        <tbody className="text-white">
          {pagedAssets.map((asset) => {
            const previewUrl = getPreviewUrl(asset);
            return (
              <tr key={asset.id} className="border-t border-zinc-700 hover:bg-zinc-800">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(asset.id)}
                    onChange={() => toggleSelectOne(asset.id)}
                  />
                </td>
                <td className="p-2 flex items-center gap-2">
                  {previewUrl ? (
                    <div
                      className="cursor-pointer"
                      onMouseEnter={() => setPreview(previewUrl)}
                      onMouseLeave={() => setPreview(null)}
                    >
                      <ImageIcon className="text-zinc-400" />
                    </div>
                  ) : (
                    <ImageIcon className="text-zinc-700" />
                  )}
                  {asset.name}
                </td>
                <td className="p-2">{asset.type}</td>
                <td className="p-2">{asset.media_files?.length || 0}</td>
                <td className="p-2 flex gap-2 items-center">
                  <button
                    className="text-blue-400 hover:text-white"
                    onClick={() => setEditingAsset(asset)}
                  >
                    <Pencil size={16} />
                  </button>
                  <span className="text-zinc-600">|</span>
                  <button
                    className="text-red-500 hover:text-white"
                    onClick={() => deleteAsset(asset.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Aktionen & Seiten */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-white gap-4 px-2">
        <div className="flex items-center gap-4">
          {selectedAssets.length > 0 && (
            <>
              <span className="text-sm">{selectedAssets.length} ausgewählt</span>
              <button
                onClick={deleteSelectedAssets}
                className="text-sm text-red-400 hover:text-white underline"
              >
                Ausgewählte löschen
              </button>
              <button
                onClick={renameTypeForSelected}
                className="text-sm text-blue-400 hover:text-white underline"
              >
                Typ umbenennen
              </button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-primary text-black" : "bg-zinc-700 hover:bg-zinc-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Immer sichtbare Box unten */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-zinc-800 border border-zinc-700 px-6 py-3 rounded shadow text-white flex flex-col items-center gap-2 w-full max-w-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Download size={16} />
            <button onClick={handleExport} className="hover:underline">
              Exportieren (ZIP)
            </button>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-2">
            <label htmlFor="import-zip" className="cursor-pointer hover:underline">
              Importieren (ZIP)
            </label>
            <input
              id="import-zip"
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>

        {importStatus && (
          <div className="w-full">
            <span className="text-sm">{importStatus}</span>
            <div className="bg-zinc-700 h-2 rounded overflow-hidden mt-1">
              <div
                className="bg-green-500 h-2 transition-all"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {editingAsset && (
        <AssetModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onUpdate={() => {
            loadAssets();
            setEditingAsset(null);
          }}
        />
      )}
    </div>
  );
}
