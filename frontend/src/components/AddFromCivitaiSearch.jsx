import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Search, 
  Download, 
  Globe, 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader, 
  X, 
  SortDesc,
  FileUp,
  Key,
  RefreshCw,
  FileDown
} from "lucide-react";

// Configure axios with default timeout
const api = axios.create({
  timeout: 30000 // 30 second timeout
});

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

  // Get download URL from model data
  const downloadUrl = version?.files?.[0]?.downloadUrl || "";

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
      const res = await api.post("/api/import/from-civitai", {
        civitai_url: civitaiUrl,
        api_key: apiKey
      });
      
      setMessage(`Successfully imported: ${res.data.name}`);
      if (onImportSuccess) onImportSuccess(res.data);
    } catch (err) {
      console.error("Import error:", err);
      
      // Improved error handling
      if (err.code === "ECONNABORTED") {
        setMessage("Import timeout: Server took too long to respond. Try again.");
      } else {
        const msg = err.response?.data?.detail || err.message || JSON.stringify(err);
        setMessage(`Import error: ${msg}`);
      }
    } finally {
      setImporting(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      // Open download URL in new tab
      window.open(downloadUrl, '_blank');
    } else {
      setMessage("Download URL is not available for this model");
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
            <div className="flex space-x-3 pt-2">
              <a
                href={`https://civitai.com/models/${model.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted text-foreground px-3 py-2 rounded font-semibold hover:bg-muted/80 flex items-center gap-2"
              >
                <Globe className="w-4 h-4" /> View
              </a>
              
              <button
                onClick={handleDownload}
                disabled={!downloadUrl}
                className="bg-blue-600 text-white px-3 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                title={downloadUrl ? "Download directly from CivitAI" : "No download URL available"}
              >
                <FileDown className="w-4 h-4" /> Download
              </button>
              
              <button
                onClick={handleImport}
                disabled={importing}
                className="bg-primary text-background px-3 py-2 rounded font-semibold hover:bg-primary/80 disabled:opacity-50 flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Import
                  </>
                )}
              </button>
            </div>
            {message && (
              <p className={`text-sm mt-2 flex items-center gap-1 ${message.startsWith("Successfully") ? "text-green-400" : "text-red-400"}`}>
                {message.startsWith("Successfully") ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {message}
              </p>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
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
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
  
  // Maximum batch size for better performance
  const BATCH_SIZE = 20;

  // Function to execute search with retry logic
  const executeSearch = async (query, currentPage, resetResults, maxRetries = 2) => {
    try {
      setIsLoading(true);
      setMessage(resetResults ? "searching" : "loading-more");
      
      // Reduced batch size for better reliability
      console.log(`Sending search: query=${query}, page=${currentPage}, sort=${sortOption}, limit=${BATCH_SIZE}`);
      
      const res = await api.get(
        `/api/import/civitai/search?query=${encodeURIComponent(query)}&api_key=${apiKey || ""}&limit=${BATCH_SIZE}&page=${currentPage}&sort=${encodeURIComponent(sortOption)}`
      );

      const newItems = res.data.items || [];
      const metadata = res.data.metadata || {};
      console.log(`Received results: ${newItems.length}, total: ${metadata.totalItems || 'unknown'}`);

      // Has more pages?
      const hasMoreResults = newItems.length === BATCH_SIZE && 
                           (metadata.currentPage < metadata.totalPages || !metadata.totalPages);
      
      return {
        items: newItems,
        hasMore: hasMoreResults
      };
    } catch (error) {
      console.error("Search error:", error);
      
      // Check if it's a timeout issue
      if (error.code === "ECONNABORTED" && maxRetries > 0) {
        console.log(`Search timed out, retrying (${maxRetries} attempts left)...`);
        // Retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, (3 - maxRetries) * 1000));
        return executeSearch(query, currentPage, resetResults, maxRetries - 1);
      }
      
      throw error;
    }
  };

  const handleSearch = async (reset = true) => {
    // Don't perform concurrent searches
    if (isLoading) return;
    
    try {
      // No search term? Don't search.
      if (!searchTerm.trim()) {
        setMessage("error-empty");
        return;
      }

      // For new searches, reset state
      if (reset) {
        setResults([]);
        setPage(1);
        setHasMore(false);
        setSelectedModel(null);
      }

      const currentPageToFetch = reset ? 1 : page;
      const searchResult = await executeSearch(searchTerm, currentPageToFetch, reset);
      
      if (searchResult.items.length === 0) {
        setMessage("no-results");
        return;
      }

      // Update results with de-duplication
      if (reset) {
        setResults(searchResult.items);
      } else {
        // For "load more", filter out duplicates
        const existingIds = new Set(results.map(item => item.id));
        const uniqueNewItems = searchResult.items.filter(item => !existingIds.has(item.id));
        setResults(prev => [...prev, ...uniqueNewItems]);
      }

      // Update state for pagination
      setHasMore(searchResult.hasMore);
      if (!reset) {
        setPage(currentPageToFetch + 1);
      }

      // Success message with count
      const totalCount = reset ? searchResult.items.length : results.length + searchResult.items.length;
      setMessage(`success-${totalCount}`);
      
      // Reset retry counter on success
      setRetryCount(0);
      
    } catch (err) {
      console.error("Search failed:", err);
      
      // Improved error messaging for different error types
      if (err.code === "ECONNABORTED") {
        setMessage("error-Search timed out. Try a more specific search term or try again later.");
      } else {
        setMessage(`error-${err.response?.data?.detail || err.message || "Unknown error"}`);
      }
      
      // Track retries for UI feedback
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const isImage = (url) => url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isVideo = (url) => url?.endsWith(".mp4") || url?.endsWith(".webm");

  const renderMessageWithIcon = () => {
    if (!message) return null;

    if (message === "searching") {
      return (
        <p className="text-sm mt-2 flex items-center gap-1 text-blue-400">
          <Loader className="w-4 h-4 animate-spin" />
          Searching...
        </p>
      );
    } else if (message === "loading-more") {
      return (
        <p className="text-sm mt-2 flex items-center gap-1 text-blue-400">
          <Loader className="w-4 h-4 animate-spin" />
          Loading more results...
        </p>
      );
    } else if (message === "error-empty") {
      return (
        <p className="text-sm mt-2 flex items-center gap-1 text-red-400">
          <XCircle className="w-4 h-4" />
          Please enter a search term
        </p>
      );
    } else if (message === "no-results") {
      return (
        <p className="text-sm mt-2 flex items-center gap-1 text-blue-400">
          <AlertCircle className="w-4 h-4" />
          No results found
        </p>
      );
    } else if (message.startsWith("success-")) {
      const count = message.split("-")[1];
      return (
        <p className="text-sm mt-2 flex items-center gap-1 text-green-400">
          <CheckCircle className="w-4 h-4" />
          {count} results loaded
        </p>
      );
    } else if (message.startsWith("error-")) {
      const error = message.substring(6);
      return (
        <p className="text-sm mt-2 flex items-center gap-1 text-red-400">
          <XCircle className="w-4 h-4" />
          Error: {error}
        </p>
      );
    }

    return null;
  };

  return (
    <div className="mb-6">
      <div className="bg-box p-6 rounded-md shadow-md mb-6">
        <h2 className="text-lg font-bold mb-4">Search CivitAI</h2>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Search term (e.g. SDXL, anime...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch(true);
              }}
              className="w-full p-2 pl-10 rounded bg-zinc-900 text-white border border-zinc-700"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Key className="w-5 h-5 text-zinc-500" />
            </div>
            <input
              type="password"
              placeholder="Optional: CivitAI API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 pl-10 rounded bg-zinc-900 text-white border border-zinc-700"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SortDesc className="w-5 h-5 text-zinc-500" />
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full p-2 pl-10 rounded bg-zinc-900 text-white border border-zinc-700 appearance-none"
            >
              <option value="Most Downloaded">Most Downloaded</option>
              <option value="Newest">Newest</option>
              <option value="Highest Rated">Highest Rated</option>
            </select>
          </div>

          <button
            onClick={() => handleSearch(true)}
            disabled={isLoading || !searchTerm.trim()}
            className="w-full bg-primary text-background font-semibold px-4 py-2 rounded hover:bg-primary/80 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search CivitAI
              </>
            )}
          </button>

          {renderMessageWithIcon()}
          
          {retryCount > 0 && (
            <div className="text-xs text-yellow-500 bg-yellow-950/30 p-2 rounded border border-yellow-900 mt-2">
              <p className="font-medium">Trouble connecting to CivitAI?</p>
              <ul className="mt-1 list-disc pl-5 space-y-1">
                <li>Try using a more specific search term</li>
                <li>Check your internet connection</li>
                <li>CivitAI may be experiencing high traffic</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <>
          <div className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-2">
              {results.map((model) => {
                const version = model.modelVersions?.[0];
                const imageUrl = version?.images?.[0]?.url?.replace("https://www.civitai.com", "https://civitai.com") || "/fallback.jpg";
                const baseModel = version?.baseModel || "?";
                const hasDownload = !!version?.files?.[0]?.downloadUrl;

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
                          loading="lazy" // Lazy load images for better performance
                        />
                      </div>
                    )}

                    <div className="bg-[#101010] text-[#e2f263] p-3 flex flex-col justify-between h-[110px]">
                      <h3 className="text-sm font-semibold whitespace-normal break-words leading-snug mb-1 line-clamp-2">
                        {model.name}
                      </h3>
                      <div className="text-xs opacity-70 flex justify-between items-center">
                        <span>{model.type}</span>
                        <div className="flex items-center">
                          {hasDownload && <FileDown className="w-3 h-3 ml-1 text-blue-400" title="Download available" />}
                          <span className="ml-2">{baseModel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {hasMore && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => handleSearch(false)}
                disabled={isLoading}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Load more results
                  </>
                )}
              </button>
            </div>
          )}
        </>
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