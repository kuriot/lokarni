import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Separate Modal components for better structure and reusability
function ModalOverlay({ children, onClose }) {
  // Prevent scrolling in the background when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90">
      {children}
    </div>
  );
}

function ModalContent({ model, onClose, onImportSuccess }) {
  const version = model.modelVersions?.[0];
  const imageUrl = version?.images?.[0]?.url?.replace("https://www.civitai.com", "https://civitai.com") || "/fallback.jpg";
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const videoRef = useRef(null);
  const isVideo = imageUrl?.endsWith(".mp4") || imageUrl?.endsWith(".webm");

  // Autoplay video when shown in modal
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(err => console.log('Modal video could not be played:', err));
    }
  }, [isVideo]);

  const handleImport = async () => {
    setImporting(true);
    setMessage("");
    
    try {
      // Get API key from localStorage
      const apiKey = localStorage.getItem("civitai-api-key") || "";
      
      // Create model URL from ID
      const civitaiUrl = `https://civitai.com/models/${model.id}`;
      
      // Use the correct endpoint and pass the appropriate data
      const res = await axios.post("/api/import/from-civitai", {
        civitai_url: civitaiUrl,
        api_key: apiKey
      });
      
      setMessage(`✅ Successfully imported: ${res.data.name}`);
      if (onImportSuccess) onImportSuccess(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || JSON.stringify(err);
      setMessage(`❌ Import error: ${msg}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full w-full p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-black">
            {isVideo ? (
              <video
                ref={videoRef}
                src={imageUrl}
                muted
                controls
                loop
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <img src={imageUrl} alt={model.name} className="w-full h-full object-contain" />
            )}
          </div>
          <div className="md:w-1/2 p-6 relative">
            <h2 className="text-xl font-bold text-white mb-2">{model.name}</h2>
            <p className="text-sm text-zinc-400 mb-2">Type: {model.type}</p>
            <p className="text-sm text-zinc-400 mb-4">Base Model: {version?.baseModel}</p>
            <div className="flex space-x-4 pt-2">
              <a
                href={`https://civitai.com/models/${model.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted text-foreground px-4 py-2 rounded font-semibold hover:bg-muted/80"
              >
                🌐 View on CivitAI
              </a>
              <button
                onClick={handleImport}
                disabled={importing}
                className="bg-primary text-background px-4 py-2 rounded font-semibold hover:bg-primary/80 disabled:opacity-50"
              >
                {importing ? "⏳ Importing..." : "📥 Import"}
              </button>
            </div>
            {message && (
              <p className={`text-sm mt-2 ${message.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddFromCivitaiSearch({ onImportSuccess }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [sortOption, setSortOption] = useState("Most Downloaded");
  const [hasMore, setHasMore] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("civitai-api-key");
    if (stored) setApiKey(stored);
  }, []);

  // Save API key to localStorage when changed
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("civitai-api-key", apiKey);
    }
  }, [apiKey]);

  // Perform new search when sort option changes
  useEffect(() => {
    if (results.length > 0) {
      handleSearch(true);
    }
  }, [sortOption]);

  const handleSearch = async (reset = true) => {
    // Reset results for a new search
    if (reset) {
      setResults([]);
      setPage(1);
      setHasMore(false);
      setMessage("🔎 Searching...");
      setSelectedModel(null);
    }

    // If not a new search and no more results to show, abort
    if (!reset && !hasMore) {
      return;
    }

    try {
      // No search term? Don't search.
      if (!searchTerm.trim()) {
        setMessage("❌ Please enter a search term");
        return;
      }

      console.log(`Sending search: query=${searchTerm}, page=${page}, sort=${sortOption}`);
      
      // Optimized API call: Fixed page sizes
      const res = await axios.get(
        `/api/import/civitai/search?query=${encodeURIComponent(searchTerm)}&api_key=${apiKey || ""}&limit=40&page=1&sort=${encodeURIComponent(sortOption)}`
      );

      const newItems = res.data.items || [];
      console.log(`Received results: ${newItems.length}`);

      if (newItems.length === 0) {
        setMessage("ℹ️ No results found");
        setHasMore(false);
        return;
      }

      // Track all IDs we already have
      let uniqueResults = [...newItems];
      
      if (!reset) {
        // For "Show more", only add new unique results
        const existingIds = new Set(results.map(item => item.id));
        uniqueResults = newItems.filter(item => !existingIds.has(item.id));
        
        // Append unique results to existing ones
        setResults(prev => [...prev, ...uniqueResults]);
      } else {
        // For a new search, just set all results
        setResults(uniqueResults);
      }

      // We disable pagination since the API doesn't provide reliable follow-up pages
      // Instead, we always show the top 40, which is sufficient for most use cases
      setHasMore(false);
      
      const totalCount = reset ? uniqueResults.length : results.length + uniqueResults.length;
      setMessage(`✅ ${totalCount} results loaded`);
    } catch (err) {
      console.error("Search error:", err);
      setMessage(`❌ Error: ${err.response?.data?.detail || err.message || "Unknown error"}`);
      setHasMore(false);
    }
  };

  const isImage = (url) => url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isVideo = (url) => url?.endsWith(".mp4") || url?.endsWith(".webm");

  return (
    <div className="mb-6">
      <div className="bg-box p-6 rounded-md shadow-md mb-6">
        <h2 className="text-lg font-bold mb-4">Search CivitAI</h2>

        <input
          type="text"
          placeholder="Search term (e.g. SDXL, anime...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded bg-zinc-900 text-white border border-zinc-700 mb-4"
        />

        <input
          type="text"
          placeholder="Optional: CivitAI API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 rounded bg-zinc-900 text-white border border-zinc-700 mb-4"
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full p-2 rounded bg-zinc-900 text-white border border-zinc-700 mb-4"
        >
          <option value="Most Downloaded">📥 Most Downloaded</option>
          <option value="Newest">🆕 Newest</option>
          <option value="Highest Rated">⭐ Highest Rated</option>
        </select>

        <button
          onClick={() => handleSearch(true)}
          className="bg-primary text-background font-semibold px-4 py-2 rounded hover:bg-opacity-90 transition"
        >
          🔍 Search (shows up to 40 top results)
        </button>

        {message && (
          <p className={`text-sm mt-2 ${message.startsWith("✅") ? "text-green-400" : message.startsWith("ℹ️") ? "text-blue-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>

      {results.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-2">
            {results.map((model) => {
              const version = model.modelVersions?.[0];
              const imageUrl = version?.images?.[0]?.url?.replace("https://www.civitai.com", "https://civitai.com") || "/fallback.jpg";
              const baseModel = version?.baseModel || "?";

              return (
                <div
                  key={model.id}
                  className="relative group bg-box rounded-lg shadow hover:shadow-xl transition overflow-hidden border border-[#2f2f2f] cursor-pointer"
                  onClick={() => setSelectedModel(model)}
                >
                  {isVideo(imageUrl) ? (
                    <div className="aspect-[9/12] bg-black overflow-hidden">
                      <VideoHoverPreview src={imageUrl} />
                    </div>
                  ) : (
                    <div className="aspect-[9/12] bg-black overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="bg-[#101010] text-[#e2f263] p-3 flex flex-col justify-between h-[110px]">
                    <h3 className="text-sm font-semibold whitespace-normal break-words leading-snug mb-1 line-clamp-2">
                      {model.name}
                    </h3>
                    <p className="text-xs opacity-70 flex justify-between">
                      <span>{model.type}</span>
                      <span className="ml-2">{baseModel}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedModel && (
        <ModalOverlay onClose={() => setSelectedModel(null)}>
          <ModalContent model={selectedModel} onClose={() => setSelectedModel(null)} onImportSuccess={onImportSuccess} />
        </ModalOverlay>
      )}
    </div>
  );
}

function VideoHoverPreview({ src }) {
  const videoRef = useRef(null);
  
  // Play video on hover
  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log('Video could not be played:', err));
    }
  };
  
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };
  
  return (
    <video
      ref={videoRef}
      src={src}
      muted
      preload="metadata"
      playsInline
      className="w-full h-full object-cover"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}