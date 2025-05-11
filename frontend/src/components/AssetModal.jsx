import { useState } from "react";
import {
  ClipboardCopy,
  X,
  Maximize,
  Pencil,
  Save,
  Trash2,
  Star,
  StarOff,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

const InfoBlock = ({ label, content }) => (
  <div className="relative">
    <label className="block text-sm font-semibold mb-1 text-primary">{label}</label>
    <div className="relative">
      <textarea
        readOnly
        value={content || ""}
        className="w-full bg-background border border-box rounded p-2 pr-10 text-text resize-none text-sm min-h-[80px]"
      />
      <button
        onClick={() => navigator.clipboard.writeText(content)}
        className="absolute top-2 right-2 text-primary hover:text-accent"
        title="Kopieren"
      >
        <ClipboardCopy size={18} />
      </button>
    </div>
  </div>
);

const EditableTextarea = ({ label, value, onChange }) => (
  <div className="relative">
    <label className="block text-sm font-semibold mb-1 text-primary">{label}</label>
    <textarea
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background border border-box rounded p-2 text-text text-sm min-h-[80px] placeholder:text-muted"
    />
  </div>
);

const EditableField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-primary mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background border border-box rounded px-2 py-1 text-text text-sm placeholder:text-muted"
    />
  </div>
);

export default function AssetModal({ asset, onClose, onUpdate }) {
  const [showFull, setShowFull] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [editName, setEditName] = useState(asset.name);
  const [editTags, setEditTags] = useState(asset.tags || "");
  const [editDescription, setEditDescription] = useState(asset.description || "");
  const [editType, setEditType] = useState(asset.type || "");
  const [editVersion, setEditVersion] = useState(asset.model_version || "");
  const [editBaseModel, setEditBaseModel] = useState(asset.base_model || "");
  const [editCreator, setEditCreator] = useState(asset.creator || "");
  const [editNSFW, setEditNSFW] = useState(asset.nsfw_level || "");
  const [editTrigger, setEditTrigger] = useState(asset.trigger_words || "");
  const [editPositive, setEditPositive] = useState(asset.positive_prompt || "");
  const [editNegative, setEditNegative] = useState(asset.negative_prompt || "");
  const [editDownload, setEditDownload] = useState(asset.download_url || "");
  const [editResources, setEditResources] = useState(asset.used_resources || "");
  const [editPath, setEditPath] = useState(asset.path || "");

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
          name: editName,
          tags: editTags,
          description: editDescription,
          type: editType,
          model_version: editVersion,
          base_model: editBaseModel,
          creator: editCreator,
          nsfw_level: editNSFW,
          trigger_words: editTrigger,
          positive_prompt: editPositive,
          negative_prompt: editNegative,
          download_url: editDownload,
          used_resources: editResources,
          path: editPath,
        }),
      });
      if (!response.ok) throw new Error("Fehler beim Speichern");
      setIsEditing(false);
      asset.name = editName;
      asset.tags = editTags;
      asset.description = editDescription;
      asset.type = editType;
      asset.model_version = editVersion;
      asset.base_model = editBaseModel;
      asset.creator = editCreator;
      asset.nsfw_level = editNSFW;
      asset.trigger_words = editTrigger;
      asset.positive_prompt = editPositive;
      asset.negative_prompt = editNegative;
      asset.download_url = editDownload;
      asset.used_resources = editResources;
      asset.path = editPath;
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
      alert("Favoritenwechsel fehlgeschlagen.");
    }
  };

  const shouldShow = (field) => isEditing || (field && field.trim() !== "");

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50" onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-background text-text rounded-lg shadow-lg w-11/12 max-w-6x2 p-0 h-[90vh] overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-8">
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
            <div className="flex-1 space-y-5 text-sm overflow-y-auto max-h-[90vh] p-8">
              <div className="flex justify-end gap-3 mb-2">
                <button onClick={handleToggleFavorite} className={`bg-box border border-box rounded-full p-2 ${asset.is_favorite ? "text-yellow-400" : "text-zinc-500"} hover:text-accent`} title={asset.is_favorite ? "Favorit entfernen" : "Als Favorit markieren"}>
                  {asset.is_favorite ? <StarOff size={20} /> : <Star size={20} />}
                </button>
                <button onClick={() => (isEditing ? handleSave() : setIsEditing(true))} disabled={saving} className="bg-box border border-box rounded-full p-2 text-primary hover:text-accent" title={isEditing ? "Speichern" : "Bearbeiten"}>
                  {isEditing ? <Save size={20} /> : <Pencil size={20} />}
                </button>
                <button onClick={handleDelete} className="bg-box border border-box rounded-full p-2 text-red-500 hover:text-red-300" title="Löschen">
                  <Trash2 size={20} />
                </button>
                <button onClick={onClose} className="bg-box border border-box rounded-full p-2 text-text hover:text-accent" title="Schließen">
                  <X size={20} />
                </button>
              </div>

              <div className="text-xl font-bold text-primary">
                {isEditing ? (
                  <input value={editName} onClick={(e) => e.stopPropagation()} onChange={(e) => setEditName(e.target.value)} className="bg-background border border-box rounded px-2 py-1 text-text w-full text-lg" />
                ) : (
                  asset.name
                )}
              </div>

              {isEditing ? (
                <EditableField label="Tags" value={editTags} onChange={setEditTags} />
              ) : (
                asset.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.split(",").map((tag, index) => (
                      <span key={index} className="bg-box text-primary text-xs px-2 py-1 rounded">{tag.trim()}</span>
                    ))}
                  </div>
                )
              )}

              <p><strong>Typ:</strong> <span className="text-primary">{asset.type}</span></p>

              {shouldShow(asset.used_resources) && (
                isEditing ? (
                  <EditableTextarea label="Verwendete Ressourcen" value={editResources} onChange={setEditResources} />
                ) : (
                  <InfoBlock label="Verwendete Ressourcen" content={asset.used_resources} />
                )
              )}

              {shouldShow(asset.trigger_words) && (isEditing ? (
                <EditableTextarea label="Trigger Words" value={editTrigger} onChange={setEditTrigger} />
              ) : (
                <InfoBlock label="Trigger Words" content={asset.trigger_words} />
              ))}

              {shouldShow(asset.positive_prompt) && (isEditing ? (
                <EditableTextarea label="Positive Prompt" value={editPositive} onChange={setEditPositive} />
              ) : (
                <InfoBlock label="Positive Prompt" content={asset.positive_prompt} />
              ))}

              {shouldShow(asset.negative_prompt) && (isEditing ? (
                <EditableTextarea label="Negative Prompt" value={editNegative} onChange={setEditNegative} />
              ) : (
                <InfoBlock label="Negative Prompt" content={asset.negative_prompt} />
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {isEditing ? (
                  <>
                    <EditableField label="Version" value={editVersion} onChange={setEditVersion} />
                    <EditableField label="Base Model" value={editBaseModel} onChange={setEditBaseModel} />
                    <EditableField label="Creator" value={editCreator} onChange={setEditCreator} />
                    <EditableField label="NSFW Level" value={editNSFW} onChange={setEditNSFW} />
                  </>
                ) : (
                  <>
                    <p><strong>Version:</strong> <span className="text-gray-300">{asset.model_version}</span></p>
                    <p><strong>Base Model:</strong> <span className="text-gray-300">{asset.base_model}</span></p>
                    <p><strong>Creator:</strong> <span className="text-gray-300">{asset.creator}</span></p>
                    <p><strong>NSFW Level:</strong> <span className="text-gray-300">{asset.nsfw_level}</span></p>
                  </>
                )}
              </div>

              {shouldShow(editPath) && (
                isEditing ? (
                  <EditableField label="Pfad" value={editPath} onChange={setEditPath} />
                ) : (
                  <InfoBlock label="Pfad" content={asset.path} />
                )
              )}

              {shouldShow(editDownload) && (isEditing ? (
                <EditableField label="Download URL / Pfad" value={editDownload} onChange={setEditDownload} />
              ) : (
                <div className="flex items-center gap-2">
                  <a href={asset.download_url} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all flex-1">{asset.download_url}</a>
                  <a href={asset.download_url} download className="text-primary hover:text-accent" title="Herunterladen">
                    <Download size={18} />
                  </a>
                </div>
              ))}

              {shouldShow(asset.description) && (
                <div className="mt-8 w-full max-w-5xl mx-auto text-sm text-gray-300">
                  <h3 className="text-primary font-semibold mb-2">Beschreibung</h3>
                  {isEditing ? (
                    <textarea value={editDescription} onClick={(e) => e.stopPropagation()} onChange={(e) => setEditDescription(e.target.value)} className="w-full bg-background border border-box rounded p-2 text-text text-sm min-h-[150px]" />
                  ) : (
                    <div className="prose prose-invert max-w-none transition-all duration-300" style={{ overflow: expanded ? "visible" : "hidden", maxHeight: expanded ? "none" : "180px" }}>
                      <div dangerouslySetInnerHTML={{ __html: asset.description }} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word" }} />
                    </div>
                  )}
                  {!isEditing && (
                    <button className="mt-2 text-primary hover:text-accent text-xs" onClick={() => setExpanded(!expanded)}>
                      {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
