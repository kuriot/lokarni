import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clipboard,
  X,
  Edit2,
  Save,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Download,
  Shield,
  Hash,
  Info,
  MessageCircle,
  Settings2,
  Tag,
  FileText,
  Copy,
  User,
  Calendar,
  Server,
  Database,
  Link,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Plus,
  Search,
  Play,
  Loader2,
  LinkIcon
} from "lucide-react";

// Define the InfoBlock component with a more prominent copy button
const InfoBlock = ({ label, content, icon: Icon }) => {
  if (!content || content.trim() === "") return null;
  
  return (
    <div className="space-y-2 relative">
      <label className="flex items-center gap-2 text-sm font-semibold text-primary">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </label>
      <div className="relative rounded-md overflow-hidden border border-border group">
        <div className="bg-card/30 p-3 pr-12 min-h-[80px] text-sm whitespace-pre-wrap break-words">
          {content || ""}
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="absolute right-2 top-2 text-muted-foreground hover:text-primary"
          onClick={() => navigator.clipboard.writeText(content)}
          title="Copy to clipboard"
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// EditableTextarea component with improved styling
const EditableTextarea = ({ label, value, onChange, icon: Icon }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-primary">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[100px] bg-card/30 border-border resize-y"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

// EditableField component with improved styling
const EditableField = ({ label, value, onChange, icon: Icon }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-primary">
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </label>
    <Input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="bg-card/30 border-border"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const AssetTab = ({ asset, active, onClick, onClose }) => {
  // Get a preview image or use a placeholder
  const hasPreview = asset.preview_image || (asset.media_files && asset.media_files.length > 0);
  const previewUrl = hasPreview 
    ? `http://localhost:8000${asset.preview_image || asset.media_files[0]}` 
    : null;
  
  return (
    <div 
      className={`flex items-center gap-2 px-2 py-1 rounded-t-md border-b-2 transition-colors cursor-pointer ${
        active 
          ? "border-primary bg-background text-primary" 
          : "border-transparent hover:bg-background/50 text-muted-foreground"
      }`}
      onClick={onClick}
    >
      <div className="w-5 h-5 rounded-sm overflow-hidden bg-muted flex-shrink-0">
        {previewUrl ? (
          <img src={previewUrl} alt={asset.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted">
            <ImageIcon className="w-3 h-3 text-muted-foreground" />
          </div>
        )}
      </div>
      <span className="max-w-[100px] truncate text-xs">{asset.name}</span>
      <Button
        variant="ghost"
        size="icon"
        className="w-4 h-4 rounded-full p-0 opacity-50 hover:opacity-100 hover:bg-accent/50"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default function AssetModal({ asset, onClose, onUpdate, onFetchAsset }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // State for asset tabs
  const [openAssets, setOpenAssets] = useState([asset]);
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);
  
  // New states for Examples tab
  const [linkedAssets, setLinkedAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAsset, setIsLoadingAsset] = useState(false);

  // Get current active asset
  const currentAsset = openAssets[activeAssetIndex];

  // Fetch linked assets when the component mounts or when asset changes
  useEffect(() => {
    if (!currentAsset.linked_assets) {
      setLinkedAssets([]);
      return;
    }
    
    // If linked_assets is an array of IDs, fetch the full asset objects
    if (Array.isArray(currentAsset.linked_assets) && currentAsset.linked_assets.length > 0) {
      const fetchLinkedAssets = async () => {
        try {
          const linkedAssetsData = [];
          for (const id of currentAsset.linked_assets) {
            // Convert to number if it's a string (sometimes comes as a string from the API)
            const assetId = typeof id === 'string' ? parseInt(id, 10) : id;
            if (!isNaN(assetId)) {
              // FIXED: Remove trailing slash to avoid 405 Method Not Allowed
              const response = await fetch(`http://localhost:8000/api/assets/${assetId}`);
              if (response.ok) {
                const data = await response.json();
                linkedAssetsData.push(data);
              }
            }
          }
          setLinkedAssets(linkedAssetsData);
        } catch (error) {
          console.error("Error fetching linked assets:", error);
          setLinkedAssets([]);
        }
      };
      
      fetchLinkedAssets();
    } else {
      setLinkedAssets([]);
    }
  }, [currentAsset]);
  
  // Initialize edit data for the current asset
  const [editData, setEditData] = useState({
    name: currentAsset.name,
    tags: currentAsset.tags || "",
    description: currentAsset.description || "",
    type: currentAsset.type || "",
    model_version: currentAsset.model_version || "",
    base_model: currentAsset.base_model || "",
    creator: currentAsset.creator || "",
    nsfw_level: currentAsset.nsfw_level || "",
    trigger_words: currentAsset.trigger_words || "",
    positive_prompt: currentAsset.positive_prompt || "",
    negative_prompt: currentAsset.negative_prompt || "",
    download_url: currentAsset.download_url || "",
    used_resources: currentAsset.used_resources || "",
    path: currentAsset.path || "",
  });

  // Update editData when currentAsset changes
  useEffect(() => {
    setEditData({
      name: currentAsset.name,
      tags: currentAsset.tags || "",
      description: currentAsset.description || "",
      type: currentAsset.type || "",
      model_version: currentAsset.model_version || "",
      base_model: currentAsset.base_model || "",
      creator: currentAsset.creator || "",
      nsfw_level: currentAsset.nsfw_level || "",
      trigger_words: currentAsset.trigger_words || "",
      positive_prompt: currentAsset.positive_prompt || "",
      negative_prompt: currentAsset.negative_prompt || "",
      download_url: currentAsset.download_url || "",
      used_resources: currentAsset.used_resources || "",
      path: currentAsset.path || "",
    });
    
    setEditCustomFields(currentAsset.custom_fields || {});
    setMediaFiles(currentAsset.media_files || []);
    setNewMediaFiles([]);
    setCurrentIndex(0);
    setActiveTab("details");
    setExpanded(false);
    setIsEditing(false);
  }, [currentAsset]);

  const [editCustomFields, setEditCustomFields] = useState(currentAsset.custom_fields || {});
  
  // Add new states for managing media files
  const [mediaFiles, setMediaFiles] = useState(currentAsset.media_files || []);
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadError, setUploadError] = useState(null);

  const IMAGE_BASE_URL = "http://localhost:8000";
  const currentMedia = mediaFiles[currentIndex];
  const previewPath = currentMedia ? IMAGE_BASE_URL + currentMedia : "https://via.placeholder.com/600x400?text=No+Preview";
  const isVideo = (path) => path?.endsWith(".webm") || path?.endsWith(".mp4");

  // Improved function to search for assets
  const searchAssets = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // FIXED: Remove trailing slash to avoid 405 Method Not Allowed
      const response = await fetch(`http://localhost:8000/api/assets/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      
      const data = await response.json();
      console.log("Search results:", data);
      
      // Filter out the current asset and already linked assets
      const currentAssetId = currentAsset.id;
      const linkedAssetIds = linkedAssets.map(a => a.id);
      
      const filteredResults = data.filter(item => {
        // Don't include the current asset
        if (item.id === currentAssetId) return false;
        
        // Don't include already linked assets
        if (linkedAssetIds.includes(item.id)) return false;
        
        // Only include if name, tags, or type match the search term
        const searchTermLower = query.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchTermLower) || 
          (item.tags && item.tags.toLowerCase().includes(searchTermLower)) ||
          (item.type && item.type.toLowerCase().includes(searchTermLower))
        );
      });
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Debounce search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchAssets(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % mediaFiles.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + mediaFiles.length) % mediaFiles.length);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewMediaFiles([...newMediaFiles, ...Array.from(e.target.files)]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleRemoveMedia = (index) => {
    const updatedFiles = [...mediaFiles];
    updatedFiles.splice(index, 1);
    setMediaFiles(updatedFiles);
    
    // Adjust current index if necessary
    if (currentIndex >= updatedFiles.length) {
      setCurrentIndex(Math.max(0, updatedFiles.length - 1));
    }
  };

  const handleRemoveNewMedia = (index) => {
    setNewMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Function to add an asset to linked assets
  const addLinkedAsset = (assetToLink) => {
    console.log("Adding linked asset:", assetToLink);
    
    // Make sure we're not adding duplicates
    if (!linkedAssets.some(a => a.id === assetToLink.id)) {
      setLinkedAssets(prev => [...prev, assetToLink]);
    }
    
    // Remove from search results
    setSearchResults(prev => prev.filter(item => item.id !== assetToLink.id));
  };
  
  // Function to remove an asset from linked assets
  const removeLinkedAsset = (assetId) => {
    setLinkedAssets(prev => prev.filter(item => item.id !== assetId));
  };

  const uploadMediaFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", editData.type);

    try {
      // Set initial progress
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));

      const response = await fetch("http://localhost:8000/api/upload-image", {
        method: "POST",
        body: formData,
        // Add a mock progress event (real implementation would use XMLHttpRequest)
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}`);
      }

      const result = await response.json();
      
      // Set complete progress
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 100
      }));

      return result.path;
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(`Failed to upload ${file.name}: ${error.message}`);
      return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setUploadError(null);
    
    try {
      // First, upload any new media files
      const uploadedPaths = [];
      
      if (newMediaFiles.length > 0) {
        for (const file of newMediaFiles) {
          const path = await uploadMediaFile(file);
          if (path) uploadedPaths.push(path);
        }
      }
      
      // Combine existing media files with newly uploaded ones
      const allMediaFiles = [...mediaFiles, ...uploadedPaths];
      
      // If we have no media files left and there were some before, ensure at least one remains
      if (allMediaFiles.length === 0 && currentAsset.media_files && currentAsset.media_files.length > 0) {
        setUploadError("You must keep at least one media file.");
        setSaving(false);
        return;
      }
      
      // Update the preview image if it was deleted
      let updatedPreviewImage = currentAsset.preview_image;
      if (currentAsset.preview_image && !allMediaFiles.includes(currentAsset.preview_image)) {
        updatedPreviewImage = allMediaFiles.length > 0 ? allMediaFiles[0] : "";
      }
      
      // Extract just the IDs from linked assets for saving
      const linkedAssetIds = linkedAssets.map(asset => asset.id);
      console.log("Saving linked asset IDs:", linkedAssetIds);
      
      const payload = {
        ...editData,
        media_files: allMediaFiles,
        preview_image: updatedPreviewImage,
        custom_fields: editCustomFields,
        linked_assets: linkedAssetIds
      };
      
      console.log("Saving asset with payload:", payload);
      
      // FIXED: Remove trailing slash to avoid 405 Method Not Allowed
      const response = await fetch(`http://localhost:8000/api/assets/${currentAsset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(errorData.detail || "Error saving changes");
      }
      
      // Update the asset object
      const updatedAsset = await response.json();
      console.log("Updated asset:", updatedAsset);
      
      // Update the current asset in the openAssets array
      setOpenAssets(prev => prev.map((a, i) => 
        i === activeAssetIndex ? updatedAsset : a
      ));
      
      setIsEditing(false);
      setNewMediaFiles([]);
      
      if (onUpdate) await onUpdate();
    } catch (err) {
      console.error("Save error:", err);
      setUploadError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

const handleDelete = async () => {
  // Verwende das korrekte window.confirm für einen Standard-Bestätigungsdialog
  if (!window.confirm("Willst du dieses Asset wirklich löschen?")) {
    return;
  }
  
  try {
    // Asset-ID extrahieren und URL vorbereiten
    const assetId = currentAsset.id;
    console.log("Attempting to delete asset ID:", assetId);
    
    // URL ohne trailing slash verwenden
    const deleteUrl = `http://localhost:8000/api/assets/${assetId}`;
    
    // DELETE-Request senden
    const response = await fetch(deleteUrl, {
      method: "DELETE"
    });
    
    // Auf Erfolg oder Fehler reagieren
    if (response.ok) {
      console.log("Delete successful");
      
      // UI nach erfolgreicher Löschung aktualisieren
      if (openAssets.length === 1) {
        if (onUpdate) await onUpdate();
        onClose();
      } else {
        setOpenAssets(prev => prev.filter((_, i) => i !== activeAssetIndex));
        setActiveAssetIndex(prev => Math.max(0, prev - 1));
        
        if (onUpdate) await onUpdate();
      }
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP-Fehler: ${response.status} - ${errorText}`);
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert(`Löschen fehlgeschlagen: ${err.message}`);
  }
};
  const handleToggleFavorite = async () => {
    try {
      // FIXED: Remove trailing slash to avoid 405 Method Not Allowed
      const response = await fetch(`http://localhost:8000/api/assets/${currentAsset.id}/favorite`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Fehler beim Favoritenwechsel");
      
      const updatedAsset = await response.json();
      console.log("Updated favorite:", updatedAsset);
      
      // Update the current asset in the openAssets array
      setOpenAssets(prev => prev.map((a, i) => 
        i === activeAssetIndex ? updatedAsset : a
      ));
      
      if (onUpdate) await onUpdate();
    } catch (err) {
      console.error(err);
      alert("Favoritenwechsel fehlgeschlagen");
    }
  };

  // Function to handle opening a linked asset in a new tab
  const handleSelectLinkedAsset = async (linkedAsset) => {
    // Check if the asset is already open
    const existingIndex = openAssets.findIndex(a => a.id === linkedAsset.id);
    
    if (existingIndex !== -1) {
      // Asset is already open, just switch to it
      setActiveAssetIndex(existingIndex);
      return;
    }
    
    // Asset is not open yet, fetch the full asset data if needed
    setIsLoadingAsset(true);
    
    try {
      let fullAssetData = linkedAsset;
      
      // If onFetchAsset is provided, use it to get the full asset data
      if (onFetchAsset) {
        fullAssetData = await onFetchAsset(linkedAsset.id);
      } 
      // Otherwise, make a direct API call
      else if (!linkedAsset.media_files || !linkedAsset.description) {
        // FIXED: Remove trailing slash to avoid 405 Method Not Allowed
        const response = await fetch(`http://localhost:8000/api/assets/${linkedAsset.id}`);
        if (response.ok) {
          fullAssetData = await response.json();
        }
      }
      
      // Add the asset to the open assets
      setOpenAssets(prev => [...prev, fullAssetData]);
      // Switch to the new asset
      setActiveAssetIndex(prev => prev + 1);
    } catch (error) {
      console.error("Error fetching linked asset:", error);
    } finally {
      setIsLoadingAsset(false);
    }
  };
  
  // Function to close a tab
  const handleCloseTab = (index) => {
    // Don't close if it's the only open tab
    if (openAssets.length <= 1) return;
    
    // Remove the asset at the specified index
    setOpenAssets(prev => prev.filter((_, i) => i !== index));
    
    // Adjust active index if necessary
    if (index <= activeAssetIndex) {
      setActiveAssetIndex(prev => Math.max(0, prev - 1));
    }
  };

  const shouldShow = (field) => isEditing || (field && field.trim() !== "");
  
  // Parse HTML in description to handle images
  const processHtmlImages = (htmlContent) => {
    if (!htmlContent) return "";
    
    // This is a simple client-side solution that adds a warning about external images
    // A more comprehensive solution would involve server-side processing
    const hasExternalImages = htmlContent.includes('<img') && (
      htmlContent.includes('src="http') || htmlContent.includes("src='http")
    );
    
    // Return content with a warning if external images are detected
    return (
      <>
        {hasExternalImages && (
          <div className="bg-amber-950/30 border border-amber-700/50 rounded p-2 mb-4 flex items-center gap-2">
            <AlertCircle className="text-amber-500 h-4 w-4 flex-shrink-0" />
            <span className="text-xs text-amber-300">
              Diese Beschreibung enthält externe Bilder, die möglicherweise nicht angezeigt werden
            </span>
          </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background text-foreground rounded-xl border border-border shadow-2xl w-11/12 max-w-7xl h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Asset Tabs at the top */}
        <div className="bg-muted/30 border-b border-border p-1 flex items-center overflow-x-auto">
          {openAssets.map((assetTab, index) => (
            <AssetTab 
              key={`tab-${assetTab.id}-${index}`}
              asset={assetTab}
              active={index === activeAssetIndex}
              onClick={() => setActiveAssetIndex(index)}
              onClose={() => handleCloseTab(index)}
            />
          ))}
        </div>
      
        {/* Main content area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left side - Media preview - explicitly setting to exactly half width on desktop */}
          <div className="w-full md:w-1/2 h-auto md:h-full flex items-center justify-center overflow-hidden bg-black/20 relative">
            {isVideo(previewPath) ? (
              <>
                <video src={previewPath} muted loop playsInline autoPlay className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30" />
                <video src={previewPath} muted loop playsInline autoPlay className="relative z-10 max-h-full max-w-full object-contain" controls />
              </>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <img src={previewPath} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30" />
                <div className="relative z-10 flex items-center justify-center h-full w-full">
                  <img
                    src={previewPath}
                    alt="Vorschau"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}
            
            {mediaFiles.length > 1 && (
              <>
                <Button 
                  onClick={handlePrev} 
                  variant="outline" 
                  size="icon" 
                  className="absolute left-4 top-1/2 z-30 transform -translate-y-1/2 bg-background/20 backdrop-blur-sm border-border/50 rounded-full h-10 w-10 hover:bg-background/40"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={handleNext} 
                  variant="outline" 
                  size="icon" 
                  className="absolute right-4 top-1/2 z-30 transform -translate-y-1/2 bg-background/20 backdrop-blur-sm border-border/50 rounded-full h-10 w-10 hover:bg-background/40"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-background/30 backdrop-blur-md rounded-full px-3 py-1 text-xs">
                  {currentIndex + 1}/{mediaFiles.length}
                </div>
              </>
            )}
          </div>

          {/* Right side - Asset details - explicitly setting to exactly half width on desktop */}
          <div className="flex-1 md:w-1/2 flex flex-col h-full bg-gradient-to-br from-background to-background/95 border-l border-border/30">
            {/* Header with buttons first, then title below */}
            <div className="p-6 border-b border-border/30">
              {/* Buttons row at the top */}
              <div className="flex justify-end gap-2 mb-4">
<Button
  onClick={handleDelete}
  variant="outline"
  size="icon"
  className="text-destructive border-destructive/50 hover:bg-destructive/10 w-8 h-8"
  title="Löschen"
>
  <Trash2 className="w-4 h-4" />
</Button>
                
                <Button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  disabled={saving}
                  variant={isEditing ? "default" : "outline"}
                  size="icon"
                  className={`w-8 h-8 ${isEditing ? "bg-primary text-primary-foreground" : ""}`}
                  title={isEditing ? "Speichern" : "Bearbeiten"}
                >
                  {isEditing ? (
                    saving ? <span className="animate-spin">⏳</span> : <Save className="w-4 h-4" />
                  ) : (
                    <Edit2 className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  onClick={handleToggleFavorite}
                  variant="outline"
                  size="icon"
                  className={`w-8 h-8 ${currentAsset.is_favorite ? "text-yellow-500 border-yellow-500/50" : "text-muted-foreground"}`}
                  title={currentAsset.is_favorite ? "Favorit entfernen" : "Als Favorit markieren"}
                >
                  <Star className={`w-4 h-4 ${currentAsset.is_favorite ? "fill-current" : ""}`} />
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="icon"
                  className="text-muted-foreground w-8 h-8"
                  title="Schließen"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Title and badges below buttons */}
              <div>
                {isEditing ? (
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="text-xl font-bold bg-background/50 mb-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h2 className="text-xl font-bold text-primary mb-2">{currentAsset.name}</h2>
                )}
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30">
                    {currentAsset.type}
                  </Badge>
                  {currentAsset.nsfw_level && (
                    <Badge variant="destructive" className="flex items-center gap-1 text-xs bg-destructive/20 text-destructive border border-destructive/30">
                      <Shield className="w-3 h-3" />
                      NSFW: {currentAsset.nsfw_level}
                    </Badge>
                  )}
                  {currentAsset.is_favorite && (
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
                      <Star className="w-3 h-3 fill-current" />
                      Favorite
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tabs for different sections */}
            <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden" value={activeTab} onValueChange={setActiveTab}>
              <div className="px-6 pt-4 border-b border-border/30">
                <TabsList className="bg-muted/50 grid grid-cols-6">
                  <TabsTrigger value="details" className="flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Details</span>
                  </TabsTrigger>
                  <TabsTrigger value="description" className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Description</span>
                  </TabsTrigger>
                  <TabsTrigger value="prompts" className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Prompts</span>
                  </TabsTrigger>
                  <TabsTrigger value="examples" className="flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Showcase</span>
                  </TabsTrigger>
                  <TabsTrigger value="media" className="flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Media</span>
                  </TabsTrigger>
                  <TabsTrigger value="technical" className="flex items-center gap-1">
                    <Settings2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Technical</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <ScrollArea className="flex-1 p-6" ref={contentRef}>
                {/* Examples Tab */}
                <TabsContent value="examples" className="space-y-4 mt-0 data-[state=active]:h-auto">
                  <Card className="border-border/50 bg-background/50 backdrop-blur-md shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-primary" />
                        Linked Examples
                      </CardTitle>
                      <CardDescription>
                        {isEditing ? "Link related assets as examples" : "Related assets shown as examples"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-6">
                          {/* Search for assets */}
                          <div className="space-y-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                type="text"
                                placeholder="Search for assets to link..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-card/30 border-border"
                              />
                            </div>
                            
                            {/* Search results */}
                            {isSearching ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : searchResults.length > 0 ? (
                              <div className="border border-border rounded-md overflow-hidden">
                                <div className="max-h-48 overflow-y-auto">
                                  {searchResults.map(result => (
                                    <div 
                                      key={`search-${result.id}`} 
                                      className="flex items-center gap-3 p-2 border-b border-border hover:bg-primary/5 transition-colors"
                                    >
                                      {/* Button moved to the left */}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="flex-shrink-0 h-8 w-8 text-primary hover:bg-primary/10"
                                        onClick={() => addLinkedAsset(result)}
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                      
                                      <div className="w-12 h-12 flex-shrink-0 bg-muted rounded overflow-hidden">
                                        {result.preview_image ? (
                                          <img 
                                            src={`${IMAGE_BASE_URL}${result.preview_image}`} 
                                            alt={result.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex items-center justify-center w-full h-full">
                                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 overflow-hidden">
                                        <div className="font-medium text-sm truncate">{result.name}</div>
                                        <div className="text-xs text-muted-foreground">{result.type}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : searchTerm && !isSearching ? (
                              <div className="text-center py-4 text-muted-foreground text-sm">
                                No matching assets found
                              </div>
                            ) : null}
                          </div>
                          
                          {/* Currently linked assets */}
                          {linkedAssets.length > 0 ? (
                            <div className="space-y-2">
                              <h3 className="text-sm font-semibold text-muted-foreground">Currently Linked</h3>
                              <div className="border border-border rounded-md overflow-hidden">
                                <div className="max-h-72 overflow-y-auto">
                                  {linkedAssets.map(item => (
                                    <div 
                                      key={`linked-${item.id}`} 
                                      className="flex items-center gap-3 p-2 border-b border-border hover:bg-primary/5 transition-colors"
                                    >
                                      {/* Remove button moved to the left */}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="flex-shrink-0 h-8 w-8 text-destructive hover:bg-destructive/10"
                                        onClick={() => removeLinkedAsset(item.id)}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                      
                                      <div className="w-12 h-12 flex-shrink-0 bg-muted rounded overflow-hidden">
                                        {item.preview_image ? (
                                          <img 
                                            src={`${IMAGE_BASE_URL}${item.preview_image}`} 
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex items-center justify-center w-full h-full">
                                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 overflow-hidden">
                                        <div className="font-medium text-sm truncate">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.type}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <LinkIcon className="w-12 h-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground mb-2">No linked assets yet</p>
                              <p className="text-xs text-muted-foreground max-w-md">
                                Use the search box above to find and link related assets as examples
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {linkedAssets.length > 0 ? (
                            <div className="space-y-2">
                              <div className="border border-border rounded-md overflow-hidden">
                                <ScrollArea className="max-h-96">
                                  {linkedAssets.map(item => (
                                    <div 
                                      key={`view-linked-${item.id}`} 
                                      className="flex items-center gap-3 p-3 border-b border-border hover:bg-primary/5 transition-colors cursor-pointer"
                                      onClick={() => handleSelectLinkedAsset(item)}
                                    >
                                      <LinkIcon className="w-5 h-5 text-primary/70 flex-shrink-0" />
                                      <div className="w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                                        {item.preview_image ? (
                                          isVideo(item.preview_image) ? (
                                            <div className="relative w-full h-full">
                                              <video 
                                                src={`${IMAGE_BASE_URL}${item.preview_image}`} 
                                                className="w-full h-full object-cover"
                                              />
                                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <Play className="w-6 h-6 text-white" />
                                              </div>
                                            </div>
                                          ) : (
                                            <img 
                                              src={`${IMAGE_BASE_URL}${item.preview_image}`} 
                                              alt={item.name}
                                              className="w-full h-full object-cover"
                                            />
                                          )
                                        ) : (
                                          <div className="flex items-center justify-center w-full h-full">
                                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 overflow-hidden">
                                        <div className="font-medium truncate">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.type}</div>
                                        {item.tags && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {item.tags.split(',').slice(0, 3).map((tag, i) => (
                                              <Badge 
                                                key={i} 
                                                variant="outline" 
                                                className="text-xs px-1 py-0 h-4 bg-primary/5"
                                              >
                                                {tag.trim()}
                                              </Badge>
                                            ))}
                                            {item.tags.split(',').length > 3 && (
                                              <Badge 
                                                variant="outline" 
                                                className="text-xs px-1 py-0 h-4 bg-muted/30"
                                              >
                                                +{item.tags.split(',').length - 3}
                                              </Badge>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </ScrollArea>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <LinkIcon className="w-16 h-16 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No linked examples</p>
                              <p className="text-xs text-muted-foreground mt-2 max-w-md">
                                This asset doesn't have any linked examples. Edit this asset to add related examples.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Media Tab */}
                <TabsContent value="media" className="space-y-4 mt-0 data-[state=active]:h-auto">
                  <Card className="border-border/50 bg-background/50 backdrop-blur-md shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-primary" />
                        Media Files
                      </CardTitle>
                      <CardDescription>
                        {isEditing ? "Manage the media files associated with this asset" : "View all media files"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-6">
                          {/* Current Media Files */}
                          {mediaFiles.length > 0 && (
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-muted-foreground">Current Files</h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {mediaFiles.map((file, index) => (
                                  <div 
                                    key={`media-${index}`} 
                                    className="relative group border border-border rounded-md overflow-hidden bg-card/30"
                                  >
                                    {isVideo(file) ? (
                                      <video 
                                        src={`${IMAGE_BASE_URL}${file}`} 
                                        className="w-full h-32 object-cover" 
                                      />
                                    ) : (
                                      <img 
                                        src={`${IMAGE_BASE_URL}${file}`} 
                                        alt={`Media ${index + 1}`}
                                        className="w-full h-32 object-cover" 
                                      />
                                    )}
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleRemoveMedia(index)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* New Media Files */}
                          {newMediaFiles.length > 0 && (
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-muted-foreground">New Files</h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {newMediaFiles.map((file, index) => (
                                  <div 
                                    key={`new-media-${index}`} 
                                    className="relative group border border-border rounded-md overflow-hidden bg-card/30"
                                  >
                                    {isVideo(file.name) ? (
                                      <div className="w-full h-32 flex items-center justify-center bg-black/50">
                                        <MessageCircle className="w-8 h-8 text-muted-foreground" />
                                      </div>
                                    ) : (
                                      <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={`New Media ${index + 1}`}
                                        className="w-full h-32 object-cover" 
                                      />
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-background/80 text-xs truncate">
                                      {file.name}
                                    </div>
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleRemoveNewMedia(index)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Upload Button */}
                          <div>
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*,video/*" 
                              multiple
                              onChange={handleFileSelect} 
                            />
                            <Button 
                              variant="outline" 
                              onClick={triggerFileInput}
                              className="w-full border-dashed border-2 py-8 flex flex-col items-center gap-2"
                            >
                              <Upload className="w-6 h-6 text-muted-foreground" />
                              <span>Click to add images or videos</span>
                            </Button>
                          </div>
                          
                          {/* Error message */}
                          {uploadError && (
                            <div className="bg-red-950/30 border border-red-700/50 rounded p-2 mt-4 flex items-center gap-2">
                              <AlertCircle className="text-red-500 h-4 w-4 flex-shrink-0" />
                              <span className="text-xs text-red-300">
                                {uploadError}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {mediaFiles.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {mediaFiles.map((file, index) => (
                                <div 
                                  key={`view-media-${index}`} 
                                  className={`border border-border rounded-md overflow-hidden bg-card/30 cursor-pointer transition-all ${currentIndex === index ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'}`}
                                  onClick={() => setCurrentIndex(index)}
                                >
                                  {isVideo(file) ? (
                                    <div className="relative">
                                      <video 
                                        src={`${IMAGE_BASE_URL}${file}`} 
                                        className="w-full h-32 object-cover" 
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <Play className="w-8 h-8 text-white" />
                                      </div>
                                    </div>
                                  ) : (
                                    <img 
                                      src={`${IMAGE_BASE_URL}${file}`} 
                                      alt={`Media ${index + 1}`}
                                      className="w-full h-32 object-cover" 
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">No media files available</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 mt-0 data-[state=active]:h-auto">
                  {/* Basic Information */}
                  <Card className="border-border/50 bg-background/50 backdrop-blur-md shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <EditableField
                            label="Type"
                            value={editData.type}
                            onChange={(v) => setEditData({ ...editData, type: v })}
                            icon={FileText}
                          />
                          <EditableField
                            label="Model Version"
                            value={editData.model_version}
                            onChange={(v) => setEditData({ ...editData, model_version: v })}
                            icon={Server}
                          />
                          <EditableField
                            label="Base Model"
                            value={editData.base_model}
                            onChange={(v) => setEditData({ ...editData, base_model: v })}
                            icon={Database}
                          />
                          <EditableField
                            label="Creator"
                            value={editData.creator}
                            onChange={(v) => setEditData({ ...editData, creator: v })}
                            icon={User}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex gap-2 items-start">
                            <FileText className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Type</p>
                              <p className="font-medium">{currentAsset.type}</p>
                            </div>
                          </div>
                          
                          {currentAsset.model_version && (
                            <div className="flex gap-2 items-start">
                              <Server className="w-4 h-4 text-primary mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Model Version</p>
                                <p className="font-medium">{currentAsset.model_version}</p>
                              </div>
                            </div>
                          )}
                          
                          {currentAsset.base_model && (
                            <div className="flex gap-2 items-start">
                              <Database className="w-4 h-4 text-primary mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Base Model</p>
                                <p className="font-medium">{currentAsset.base_model}</p>
                              </div>
                            </div>
                          )}
                          
                          {currentAsset.creator && (
                            <div className="flex gap-2 items-start">
                              <User className="w-4 h-4 text-primary mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Creator</p>
                                <p className="font-medium">{currentAsset.creator}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Tags Section */}
                  <Card className="border-border/50 bg-background/50 backdrop-blur-md shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <EditableField
                          label="Tags (comma separated)"
                          value={editData.tags}
                          onChange={(v) => setEditData({ ...editData, tags: v })}
                          icon={Tag}
                        />
                      ) : (
                        currentAsset.tags ? (
                          <div className="flex flex-wrap gap-2 py-1">
                            {currentAsset.tags.split(",").map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="bg-primary/5 hover:bg-primary/10 transition-colors"
                              >
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No tags available</p>
                        )
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Custom Fields Section */}
                  {Object.keys(editCustomFields).length > 0 && (
                    <Card className="border-border/50 bg-background/50 backdrop-blur-md shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Hash className="w-4 h-4 text-primary" />
                          Custom Metadata
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(editCustomFields).map(([key, value]) => (
                              <EditableField
                                key={key}
                                label={key}
                                value={value}
                                onChange={(v) => setEditCustomFields({ ...editCustomFields, [key]: v })}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                            {Object.entries(editCustomFields).map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <p className="text-xs text-muted-foreground">{key}</p>
                                <p className="font-medium">{value}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="prompts" className="space-y-4 mt-0 data-[state=active]:h-auto">
                  {isEditing ? (
                    <>
                      <EditableTextarea
                        label="Trigger Words"
                        value={editData.trigger_words}
                        onChange={(v) => setEditData({ ...editData, trigger_words: v })}
                        icon={Tag}
                      />
                      <EditableTextarea
                        label="Positive Prompt"
                        value={editData.positive_prompt}
                        onChange={(v) => setEditData({ ...editData, positive_prompt: v })}
                        icon={MessageCircle}
                      />
                      <EditableTextarea
                        label="Negative Prompt"
                        value={editData.negative_prompt}
                        onChange={(v) => setEditData({ ...editData, negative_prompt: v })}
                        icon={MessageCircle}
                      />
                    </>
                  ) : (
                    <>
                      <InfoBlock 
                        label="Trigger Words" 
                        content={currentAsset.trigger_words} 
                        icon={Tag}
                      />
                      <InfoBlock 
                        label="Positive Prompt" 
                        content={currentAsset.positive_prompt} 
                        icon={MessageCircle}
                      />
                      <InfoBlock 
                        label="Negative Prompt" 
                        content={currentAsset.negative_prompt} 
                        icon={MessageCircle}
                      />
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="technical" className="space-y-4 mt-0 data-[state=active]:h-auto">
                  {isEditing ? (
                    <>
                      <EditableTextarea
                        label="Used Resources"
                        value={editData.used_resources}
                        onChange={(v) => setEditData({ ...editData, used_resources: v })}
                        icon={Settings2}
                      />
                      <EditableField
                        label="Path"
                        value={editData.path}
                        onChange={(v) => setEditData({ ...editData, path: v })}
                        icon={FileText}
                      />
                      <EditableField
                        label="Download URL"
                        value={editData.download_url}
                        onChange={(v) => setEditData({ ...editData, download_url: v })}
                        icon={Link}
                      />
                    </>
                  ) : (
                    <>
                      <InfoBlock 
                        label="Used Resources" 
                        content={currentAsset.used_resources} 
                        icon={Settings2}
                      />
                      <InfoBlock 
                        label="Path" 
                        content={currentAsset.path} 
                        icon={FileText}
                      />
                      
                      {currentAsset.download_url && (
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Link className="w-4 h-4" />
                            Download URL
                          </label>
                          <div className="flex bg-card/30 border border-border rounded-md overflow-hidden">
                            <div className="flex-1 p-3 text-sm break-all">
                              {currentAsset.download_url}
                            </div>
                            <div className="flex border-l border-border">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-none border-r border-border h-auto aspect-square"
                                onClick={() => navigator.clipboard.writeText(currentAsset.download_url)}
                                title="Copy URL"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <a 
                                href={currentAsset.download_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center aspect-square p-2 hover:bg-primary/10 transition-colors"
                                title="Open in new tab"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="description" className="space-y-4 mt-0 data-[state=active]:h-auto">
                  {isEditing ? (
                    <EditableTextarea
                      label="Description"
                      value={editData.description}
                      onChange={(v) => setEditData({ ...editData, description: v })}
                      icon={FileText}
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <FileText className="w-4 h-4" />
                        Description
                      </label>
                      <Card className="border-border/50 bg-background/50 backdrop-blur-md shadow-sm">
                        <CardContent className={`prose prose-invert max-w-none p-4 ${!expanded ? 'max-h-[400px] overflow-hidden relative' : ''}`}>
                          {processHtmlImages(currentAsset.description)}
                          {!expanded && currentAsset.description && currentAsset.description.length > 500 && (
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
                          )}
                        </CardContent>
                        {currentAsset.description && currentAsset.description.length > 500 && (
                          <CardFooter className="p-2 flex justify-center border-t border-border/30">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setExpanded(!expanded)}
                              className="text-xs text-primary w-full"
                            >
                              {expanded ? "Show Less" : "Show More"}
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </motion.div>
      
      {/* Loading overlay for asset transitions */}
      {isLoadingAsset && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-sm">Loading asset...</p>
          </div>
        </div>
      )}
    </div>
  );
}