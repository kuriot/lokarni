import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

const InfoBlock = ({ label, content }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-primary">{label}</label>
    <div className="relative group">
      <div className="bg-background border border-box rounded p-2 pr-10 min-h-[80px]">
        <p className="text-sm text-text whitespace-pre-wrap break-words">{content || ""}</p>
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(content)}
        className="absolute top-2 right-2 text-primary hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
        title="Kopieren"
      >
        <Clipboard className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const EditableTextarea = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-primary">{label}</label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background border border-box rounded p-2 text-text text-sm min-h-[80px]"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const EditableField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-primary mb-1">{label}</label>
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background border border-box rounded px-2 py-1 text-text text-sm"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

export default function AssetModal({ asset, onClose, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [editData, setEditData] = useState({
    name: asset.name,
    tags: asset.tags || "",
    description: asset.description || "",
    type: asset.type || "",
    model_version: asset.model_version || "",
    base_model: asset.base_model || "",
    creator: asset.creator || "",
    nsfw_level: asset.nsfw_level || "",
    trigger_words: asset.trigger_words || "",
    positive_prompt: asset.positive_prompt || "",
    negative_prompt: asset.negative_prompt || "",
    download_url: asset.download_url || "",
    used_resources: asset.used_resources || "",
    path: asset.path || "",
  });

  const [editCustomFields, setEditCustomFields] = useState(asset.custom_fields || {});

  const IMAGE_BASE_URL = "http://localhost:8000";
  const mediaFiles = asset.media_files || [];
  const currentMedia = mediaFiles[currentIndex];
  const previewPath = currentMedia ? IMAGE_BASE_URL + currentMedia : "https://via.placeholder.com/600x400?text=No+Preview";
  const isVideo = previewPath.endsWith(".webm") || previewPath.endsWith(".mp4");

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % mediaFiles.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + mediaFiles.length) % mediaFiles.length);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/api/assets/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editData,
          custom_fields: editCustomFields,
        }),
      });
      if (!response.ok) throw new Error("Fehler beim Speichern");
      setIsEditing(false);
      
      // Update the asset object
      Object.assign(asset, editData);
      asset.custom_fields = editCustomFields;
      
      if (onUpdate) await onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Willst du dieses Asset wirklich löschen?")) return;
    try {
      const response = await fetch(`http://localhost:8000/api/assets/${asset.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Fehler beim Löschen");
      if (onUpdate) await onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Löschen fehlgeschlagen");
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/assets/${asset.id}/favorite`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Fehler beim Favoritenwechsel");
      if (onUpdate) await onUpdate();
    } catch (err) {
      console.error(err);
      alert("Favoritenwechsel fehlgeschlagen");
    }
  };

  const shouldShow = (field) => isEditing || (field && field.trim() !== "");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-background text-text rounded-lg shadow-lg w-11/12 max-w-6x2 p-0 h-[90vh] overflow-hidden"
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side - Media preview */}
          <div className="relative w-full md:w-1/2 h-full max-h-[90vh] flex items-center justify-center overflow-hidden">
            {isVideo ? (
              <>
                <video src={previewPath} muted loop playsInline autoPlay className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30" />
                <video src={previewPath} muted loop playsInline autoPlay className="relative z-10 max-h-full object-contain" />
              </>
            ) : (
              <div className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
                <img src={previewPath} alt="" className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30" />
                <div className="relative z-10 flex items-center justify-center h-full">
                  <img
                    src={previewPath}
                    alt="Vorschau"
                    style={{
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </div>
            )}
            <button onClick={handlePrev} className="absolute left-2 top-1/2 z-20 transform -translate-y-1/2 bg-black bg-opacity-50 p-1 rounded-full">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNext} className="absolute right-2 top-1/2 z-20 transform -translate-y-1/2 bg-black bg-opacity-50 p-1 rounded-full">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Right side - Asset details */}
          <div className="flex-1 space-y-5 text-sm overflow-y-auto max-h-[90vh] p-8">
            {/* Header */}
            <div className="flex justify-end gap-3 mb-2">
              <button onClick={handleToggleFavorite} className={`bg-box border border-box rounded-full p-2 ${asset.is_favorite ? "text-yellow-400" : "text-zinc-500"} hover:text-accent`} title={asset.is_favorite ? "Favorit entfernen" : "Als Favorit markieren"}>
                {asset.is_favorite ? <Star className="w-5 h-5 fill-current" /> : <Star className="w-5 h-5" />}
              </button>
              <button onClick={() => (isEditing ? handleSave() : setIsEditing(true))} disabled={saving} className="bg-box border border-box rounded-full p-2 text-primary hover:text-accent" title={isEditing ? "Speichern" : "Bearbeiten"}>
                {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
              </button>
              <button onClick={handleDelete} className="bg-box border border-box rounded-full p-2 text-red-500 hover:text-red-300" title="Löschen">
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="bg-box border border-box rounded-full p-2 text-text hover:text-accent" title="Schließen">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-xl font-bold text-primary mb-4">
              {isEditing ? (
                <input 
                  value={editData.name} 
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="bg-background border border-box rounded px-2 py-1 text-text w-full text-lg" 
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                asset.name
              )}
            </div>

            {/* Type & Tags */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">Type:</span>
                <Badge variant="secondary">{asset.type}</Badge>
                {asset.nsfw_level && (
                  <Badge variant="destructive" className="gap-1">
                    <Shield className="w-3 h-3" />
                    NSFW: {asset.nsfw_level}
                  </Badge>
                )}
              </div>
              
              {/* Tags */}
              {isEditing ? (
                <EditableField
                  label="Tags"
                  value={editData.tags}
                  onChange={(v) => setEditData({ ...editData, tags: v })}
                />
              ) : (
                asset.tags && (
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.split(",").map((tag, index) => (
                      <span key={index} className="bg-box text-primary text-xs px-2 py-1 rounded">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Basic Information */}
            {(shouldShow(editData.model_version) || shouldShow(editData.base_model) || 
              shouldShow(editData.creator) || isEditing) && (
              <div className="rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
                <div className="bg-zinc-800 p-4 border-b border-zinc-700">
                  <h3 className="text-primary font-bold flex items-center">
                    <span className="mr-2">ℹ️</span> Basic Information
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shouldShow(editData.model_version) && (
                    isEditing ? (
                      <EditableField
                        label="Version"
                        value={editData.model_version}
                        onChange={(v) => setEditData({ ...editData, model_version: v })}
                      />
                    ) : (
                      <p><strong>Version:</strong> <span className="text-gray-300">{asset.model_version}</span></p>
                    )
                  )}
                  
                  {shouldShow(editData.base_model) && (
                    isEditing ? (
                      <EditableField
                        label="Base Model"
                        value={editData.base_model}
                        onChange={(v) => setEditData({ ...editData, base_model: v })}
                      />
                    ) : (
                      <p><strong>Base Model:</strong> <span className="text-gray-300">{asset.base_model}</span></p>
                    )
                  )}
                  
                  {shouldShow(editData.creator) && (
                    isEditing ? (
                      <EditableField
                        label="Creator"
                        value={editData.creator}
                        onChange={(v) => setEditData({ ...editData, creator: v })}
                      />
                    ) : (
                      <p><strong>Creator:</strong> <span className="text-gray-300">{asset.creator}</span></p>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Prompts & Triggers */}
            {(shouldShow(editData.trigger_words) || shouldShow(editData.positive_prompt) || 
              shouldShow(editData.negative_prompt) || isEditing) && (
              <div className="rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
                <div className="bg-zinc-800 p-4 border-b border-zinc-700">
                  <h3 className="text-primary font-bold flex items-center">
                    <span className="mr-2">💬</span> Prompts & Triggers
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {shouldShow(editData.trigger_words) && (
                    isEditing ? (
                      <EditableTextarea
                        label="Trigger Words"
                        value={editData.trigger_words}
                        onChange={(v) => setEditData({ ...editData, trigger_words: v })}
                      />
                    ) : (
                      <InfoBlock label="Trigger Words" content={asset.trigger_words} />
                    )
                  )}
                  
                  {shouldShow(editData.positive_prompt) && (
                    isEditing ? (
                      <EditableTextarea
                        label="Positive Prompt"
                        value={editData.positive_prompt}
                        onChange={(v) => setEditData({ ...editData, positive_prompt: v })}
                      />
                    ) : (
                      <InfoBlock label="Positive Prompt" content={asset.positive_prompt} />
                    )
                  )}
                  
                  {shouldShow(editData.negative_prompt) && (
                    isEditing ? (
                      <EditableTextarea
                        label="Negative Prompt"
                        value={editData.negative_prompt}
                        onChange={(v) => setEditData({ ...editData, negative_prompt: v })}
                      />
                    ) : (
                      <InfoBlock label="Negative Prompt" content={asset.negative_prompt} />
                    )
                  )}
                </div>
              </div>
            )}

            {/* Technical Details */}
            {(shouldShow(editData.used_resources) || shouldShow(editData.path) || 
              shouldShow(editData.download_url) || isEditing) && (
              <div className="rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
                <div className="bg-zinc-800 p-4 border-b border-zinc-700">
                  <h3 className="text-primary font-bold flex items-center">
                    <span className="mr-2">⚙️</span> Technical Details
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {shouldShow(editData.used_resources) && (
                    isEditing ? (
                      <EditableTextarea
                        label="Used Resources"
                        value={editData.used_resources}
                        onChange={(v) => setEditData({ ...editData, used_resources: v })}
                      />
                    ) : (
                      <InfoBlock label="Used Resources" content={asset.used_resources} />
                    )
                  )}
                  
                  {shouldShow(editData.path) && (
                    isEditing ? (
                      <EditableField
                        label="Path"
                        value={editData.path}
                        onChange={(v) => setEditData({ ...editData, path: v })}
                      />
                    ) : (
                      <InfoBlock label="Path" content={asset.path} />
                    )
                  )}
                  
                  {shouldShow(editData.download_url) && (
                    isEditing ? (
                      <EditableField
                        label="Download URL"
                        value={editData.download_url}
                        onChange={(v) => setEditData({ ...editData, download_url: v })}
                      />
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-primary">Download URL</label>
                        <div className="flex items-center gap-2">
                          <a href={asset.download_url} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all flex-1">
                            {asset.download_url}
                          </a>
                          <a href={asset.download_url} download className="text-primary hover:text-accent" title="Herunterladen">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {Object.keys(editCustomFields).length > 0 && (
              <div className="rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
                <div className="bg-zinc-800 p-4 border-b border-zinc-700">
                  <h3 className="text-primary font-bold flex items-center">
                    <span className="mr-2">🔖</span> Custom Metadata
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(editCustomFields).map(([key, value]) => (
                    isEditing ? (
                      <EditableField
                        key={key}
                        label={key}
                        value={value}
                        onChange={(v) => setEditCustomFields({ ...editCustomFields, [key]: v })}
                      />
                    ) : (
                      <div key={key}>
                        <strong>{key}:</strong> <span className="text-gray-300">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {shouldShow(editData.description) && (
              <div className="mt-8 w-full text-sm text-gray-300">
                <h3 className="text-primary font-semibold mb-2">Beschreibung</h3>
                {isEditing ? (
                  <textarea 
                    value={editData.description} 
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full bg-background border border-box rounded p-2 text-text text-sm min-h-[150px]" 
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="prose prose-invert max-w-none transition-all duration-300" 
                    style={{ 
                      overflow: expanded ? "visible" : "hidden", 
                      maxHeight: expanded ? "none" : "180px" 
                    }}>
                    <div 
                      dangerouslySetInnerHTML={{ __html: asset.description }} 
                      style={{ 
                        whiteSpace: "pre-wrap", 
                        wordBreak: "break-word", 
                        overflowWrap: "break-word" 
                      }} 
                    />
                  </div>
                )}
                {!isEditing && asset.description.length > 200 && (
                  <button 
                    className="mt-2 text-primary hover:text-accent text-xs" 
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}