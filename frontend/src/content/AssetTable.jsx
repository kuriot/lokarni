import { useEffect, useState } from "react";
import { Trash2, Image as ImageIcon, Pencil, Download, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, Search, SortAsc, SortDesc } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 20;

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/assets/");
      setAssets(res.data);
      setSelectedAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const findAssetById = async (id) => {
    const res = await axios.get(`/api/assets/${id}`);
    return res.data;
  };

  const deleteAsset = async (id) => {
    if (!window.confirm("Dieses Asset wirklich löschen?")) return;
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
      setTimeout(() => setImportStatus(""), 180000);
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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pagedAssets = filteredAssets.slice(startIndex, endIndex);

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
  try {
    setImportStatus("Export wird vorbereitet...");
    
    // Use axios instead of fetch for more consistent behavior
    const response = await axios.get('/api/assets/export/', {
      responseType: 'blob', // Important for binary data
      timeout: 60000, // 60 second timeout for large exports
      headers: {
        'Accept': 'application/zip',
      }
    });

    // Create the download
    const blob = new Blob([response.data], { type: 'application/zip' });
    const date = new Date().toISOString().slice(0, 10);
    const filename = `Lokarni_Export_${date}.zip`;

    saveAs(blob, filename);

    setImportStatus("Export erfolgreich ✅");
    setTimeout(() => setImportStatus(""), 3000);
  } catch (error) {
    console.error('Export Fehler:', error);
    
    // Detailed error message
    let errorMessage = "Export fehlgeschlagen ❌";
    if (error.response) {
      errorMessage += ` (${error.response.status})`;
    } else if (error.request) {
      errorMessage += " (Keine Antwort vom Server)";
    } else {
      errorMessage += ` (${error.message})`;
    }
    
    setImportStatus(errorMessage);
    setTimeout(() => setImportStatus(""), 5000);
  }
};

  // Pagination controls
  const goToPage = (page) => {
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page);
    }
  };

  const Pagination = () => {
    const maxPageButtons = 5;
    const halfRange = Math.floor(maxPageButtons / 2);
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(pageCount, startPage + maxPageButtons - 1);
    
    if (endPage - startPage < maxPageButtons - 1) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === 1 
              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
              : "bg-zinc-800 hover:bg-zinc-700 text-white"
          }`}
          title="Erste Seite"
        >
          <ChevronsLeft size={16} />
        </button>
        
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === 1 
              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
              : "bg-zinc-800 hover:bg-zinc-700 text-white"
          }`}
          title="Vorherige Seite"
        >
          <ChevronLeft size={16} />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => goToPage(1)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="text-zinc-600 px-2">...</span>}
          </>
        )}
        
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => goToPage(pageNum)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentPage === pageNum 
                ? "bg-primary text-zinc-900 font-semibold" 
                : "bg-zinc-800 hover:bg-zinc-700 text-white"
            }`}
          >
            {pageNum}
          </button>
        ))}
        
        {endPage < pageCount && (
          <>
            {endPage < pageCount - 1 && <span className="text-zinc-600 px-2">...</span>}
            <button
              onClick={() => goToPage(pageCount)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              {pageCount}
            </button>
          </>
        )}
        
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === pageCount}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === pageCount 
              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
              : "bg-zinc-800 hover:bg-zinc-700 text-white"
          }`}
          title="Nächste Seite"
        >
          <ChevronRight size={16} />
        </button>
        
        <button
          onClick={() => goToPage(pageCount)}
          disabled={currentPage === pageCount}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === pageCount 
              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
              : "bg-zinc-800 hover:bg-zinc-700 text-white"
          }`}
          title="Letzte Seite"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-zinc-950 rounded-xl shadow-2xl overflow-hidden">
      {preview && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-900 border border-zinc-700 p-2 rounded-lg shadow-2xl">
          {isVideo(preview) ? (
            <video src={preview} className="w-64 h-64 object-cover rounded" autoPlay loop muted />
          ) : (
            <img src={preview} alt="Vorschau" className="w-64 h-64 object-cover rounded" />
          )}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 border-b border-zinc-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Asset Verwaltung</h2>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              <Download size={16} />
              Export
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-zinc-900 rounded-lg cursor-pointer transition-colors font-semibold">
              <Download size={16} className="rotate-180" />
              Import
              <input
                type="file"
                accept=".zip"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="text"
              placeholder="Suchen nach Name..."
              className="w-full bg-zinc-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
            <select
              className="w-full bg-zinc-800 text-white pl-10 pr-8 py-3 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Alle Typen</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            {sortAsc ? (
              <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
            ) : (
              <SortDesc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={20} />
            )}
            <select
              className="w-full bg-zinc-800 text-white pl-10 pr-8 py-3 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={sortKey}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="name">Nach Name</option>
              <option value="type">Nach Typ</option>
              <option value="media">Nach Medienanzahl</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Results info and pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="text-zinc-400">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span>Lade Assets...</span>
              </div>
            ) : (
              <span className="text-sm">
                Zeige <span className="text-white font-semibold">{startIndex + 1} - {Math.min(endIndex, filteredAssets.length)}</span> von <span className="text-white font-semibold">{filteredAssets.length}</span> Assets
              </span>
            )}
          </div>
          <Pagination />
        </div>

        {/* Table */}
        <div className="bg-zinc-900 rounded-lg overflow-x-auto shadow-inner">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="w-12 p-3 text-left">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={pagedAssets.length > 0 && pagedAssets.every((a) => selectedAssets.includes(a.id))}
                    className="rounded border-zinc-600 bg-zinc-700 focus:ring-2 focus:ring-primary"
                  />
                </th>
                <th className="min-w-[250px] p-3 text-left cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-2">
                    Name 
                    {sortKey === "name" && (
                      <span className="text-primary">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th className="w-32 p-3 text-left cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("type")}>
                  <div className="flex items-center gap-2">
                    Typ
                    {sortKey === "type" && (
                      <span className="text-primary">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th className="w-24 p-3 text-left cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("media")}>
                  <div className="flex items-center gap-2">
                    Medien
                    {sortKey === "media" && (
                      <span className="text-primary">{sortAsc ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th className="w-32 p-3 text-left">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {pagedAssets.map((asset, index) => {
                const previewUrl = getPreviewUrl(asset);
                return (
                  <tr key={asset.id} className={`border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors ${index % 2 === 0 ? 'bg-zinc-900/50' : ''}`}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset.id)}
                        onChange={() => toggleSelectOne(asset.id)}
                        className="rounded border-zinc-600 bg-zinc-700 focus:ring-2 focus:ring-primary"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {previewUrl ? (
                          <div
                            className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all flex-shrink-0"
                            onMouseEnter={() => setPreview(previewUrl)}
                            onMouseLeave={() => setPreview(null)}
                          >
                            {isVideo(previewUrl) ? (
                              <video src={previewUrl} className="w-full h-full object-cover" />
                            ) : (
                              <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="text-zinc-600" size={20} />
                          </div>
                        )}
                        <span className="font-medium truncate max-w-[300px]" title={asset.name}>
                          {asset.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 max-w-full truncate" title={asset.type}>
                        {asset.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {asset.media_files?.length || 0}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          onClick={() => setEditingAsset(asset)}
                          title="Bearbeiten"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          onClick={() => deleteAsset(asset.id)}
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
          <div className="flex flex-wrap items-center gap-3">
            {selectedAssets.length > 0 && (
              <>
                <span className="text-zinc-400 font-medium">
                  {selectedAssets.length} ausgewählt
                </span>
                <button
                  onClick={deleteSelectedAssets}
                  className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium"
                >
                  Auswahl löschen
                </button>
                <button
                  onClick={renameTypeForSelected}
                  className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors text-sm font-medium"
                >
                  Typ umbenennen
                </button>
              </>
            )}
          </div>
          <Pagination />
        </div>
      </div>

      {/* Import Status (if active) */}
      {importStatus && (
        <div className="fixed bottom-4 right-4 bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-2xl max-w-sm">
          <p className="text-sm text-white mb-2">{importStatus}</p>
          {importProgress > 0 && (
            <div className="bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-2 transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {editingAsset && (
        <AssetModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onUpdate={async () => {
            const updated = await findAssetById(editingAsset.id);
            setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            setEditingAsset(null);
          }}
        />
      )}
    </div>
  );
}