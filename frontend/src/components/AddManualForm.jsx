import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, Save, Upload, Link, Image, FileText, MessageSquare, Settings2, 
  Tag, Plus, X, CheckCircle, XCircle, FolderOpen, Calendar, User, 
  Globe, Download, Shield, Camera, AlertCircle, Hash, Database
} from "lucide-react";

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

  // Custom fields for generation settings and model information
  const [customFields, setCustomFields] = useState({
    // Generation Settings
    Steps: "",
    Sampler: "",
    "Guidance scale": "",
    Seed: "",
    Size: "",
    // Model Information
    "Model hash": "",
    Model: "",
    "LoRA hashes": "",
    Version: "",
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [urlInputs, setUrlInputs] = useState([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  
  const [newTypeInput, setNewTypeInput] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);
  const [isSubmittingType, setIsSubmittingType] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingNewTypes, setPendingNewTypes] = useState([]);
  
  // Refs for drag and drop
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    fetchAvailableTypes();
  }, []);

  const fetchAvailableTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const response = await fetch("http://localhost:8000/api/asset-types");
      
      if (response.ok) {
        const data = await response.json();
        // Also add all pendingNewTypes
        const allTypes = [...new Set([...data, ...pendingNewTypes])];
        setAvailableTypes(allTypes);
      } else {
        console.error("Failed to load asset types");
        const defaultTypes = [
          "Checkpoint", "LoRA", "Embedding", "Controlnet", 
          "Poses", "Wildcards", "LyCORIS", "Hypernetwork", "Other"
        ];
        setAvailableTypes([...new Set([...defaultTypes, ...pendingNewTypes])]);
      }
    } catch (error) {
      console.error("Error fetching asset types:", error);
      const defaultTypes = [
        "Checkpoint", "LoRA", "Embedding", "Controlnet", 
        "Poses", "Wildcards", "LyCORIS", "Hypernetwork", "Other"
      ];
      setAvailableTypes([...new Set([...defaultTypes, ...pendingNewTypes])]);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const handleAddType = async () => {
    if (!newTypeInput.trim()) return;
    
    setIsSubmittingType(true);
    try {
      // Local update: add the new type to the local list
      const newType = newTypeInput.trim();
      setPendingNewTypes(prev => [...prev, newType]);
      
      // Update available types
      setAvailableTypes(prev => [...prev, newType]);
      
      // Set the new type directly in the form
      setFormData(prev => ({ ...prev, type: newType }));
      
      // Reset the UI
      setNewTypeInput("");
      setIsAddingType(false);
      
      // Show some feedback to the user
      setFormSuccess("Typ hinzugefügt. Das Asset mit diesem Typ wird erst gespeichert, wenn Sie das Formular abschicken.");
      setTimeout(() => setFormSuccess(""), 3000);
    } finally {
      setIsSubmittingType(false);
    }
  };

  useEffect(() => {
    const urls = mediaFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [mediaFiles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (name, value) => {
    setCustomFields(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setMediaFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUrlInputChange = (index, value) => {
    setUrlInputs((prev) => {
      const updated = [...prev];
      updated[index] = value;
      
      if (index === updated.length - 1 && value.trim()) {
        updated.push("");
      }
      
      return updated;
    });
  };

  const removeUrlInput = (index) => {
    setUrlInputs(prev => {
      if (prev.length === 1 && !prev[0]) {
        return prev;
      }
      
      const updated = [...prev];
      updated.splice(index, 1);
      
      if (updated.length === 0) {
        updated.push("");
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    if (!formData.name || !formData.type) {
      setFormError("Name and type are required");
      setIsSubmitting(false);
      return;
    }

    let media_files = [];
    let preview_image_path = "";

    try {
      // Process file uploads
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
          throw new Error("File upload failed");
        }
      }

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
            throw new Error(`Error uploading URL: ${url}`);
          }
        }
      }

      // Remove empty custom fields
      const filteredCustomFields = Object.fromEntries(
        Object.entries(customFields).filter(([_, value]) => value.trim() !== "")
      );
      // Create payload with all data
      const payload = {
        ...formData,
        preview_image: preview_image_path,
        media_files,
        path: `/models/${formData.type}/${formData.name.replace(/\s+/g, "_").toLowerCase()}.ckpt`,
        custom_fields: filteredCustomFields,
      };

      const response = await fetch("http://localhost:8000/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const asset = await response.json();
        
        // If the type is new, add it to the server now
        if (pendingNewTypes.includes(formData.type)) {
          // Add the type to the server now
          await fetch("http://localhost:8000/api/asset-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: formData.type })
          });
          
          // Remove the type from pendingNewTypes
          setPendingNewTypes(prev => prev.filter(t => t !== formData.type));
        }
        if (onSave) onSave(asset);
        
        // Reset form
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
        setCustomFields({
          Steps: "",
          Sampler: "",
          "Guidance scale": "",
          Seed: "",
          Size: "",
          "Model hash": "",
          Model: "",
          "LoRA hashes": "",
          Version: "",
        });
        setMediaFiles([]);
        setPreviewUrls([]);
        setUrlInputs([""]);
        setFormSuccess("Asset saved successfully!");
        
        setTimeout(() => {
          setFormSuccess("");
        }, 3000);
      } else {
        throw new Error("Error saving asset");
      }
    } catch (error) {
      setFormError(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldGroups = {
    basic: ["name", "type", "description", "tags"],
    prompts: ["positive_prompt", "negative_prompt", "trigger_words"],
    technical: ["model_version", "base_model", "created_at", "used_resources", "nsfw_level"],
    meta: ["creator", "slug", "download_url"]
  };

  const customFieldGroups = {
    generation: ["Steps", "Sampler", "Guidance scale", "Seed", "Size"],
    model: ["Model hash", "Model", "LoRA hashes", "Version"]
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Add New Asset</h1>
        <p className="text-zinc-400">Create a new entry with detailed information and media</p>
      </div>

      {(formError || formSuccess) && (
        <Alert
          className={`mb-6 ${
            formError 
              ? "border-red-900 bg-red-950/50" 
              : "border-green-900 bg-green-950/50"
          }`}
        >
          {formError ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{formError || formSuccess}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Media upload section */}
          <div className="xl:col-span-1">
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Media Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Local file upload with drag & drop */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Upload Images/Videos</label>
                  <div
                    ref={dropZoneRef}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed ${isDragging ? 'border-primary bg-primary/5' : 'border-zinc-700 hover:border-zinc-600'} rounded-lg p-4 transition-colors cursor-pointer`}
                  >
                    {previewUrls.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {previewUrls.map((url, idx) => (
                          <div key={idx} className="relative group">
                            {mediaFiles[idx]?.type?.startsWith("video/") ? (
                              <video 
                                src={url} 
                                controls 
                                className="w-full h-24 object-cover rounded border border-zinc-700" 
                              />
                            ) : (
                              <img 
                                src={url} 
                                alt="Preview" 
                                className="w-full h-24 object-cover rounded border border-zinc-700" 
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-primary' : 'text-zinc-500'}`} />
                        <p className={`mt-2 text-sm ${isDragging ? 'text-primary' : 'text-zinc-400'}`}>
                          {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Images or videos supported
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* URL inputs */}
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Media URLs
                  </label>
                  <div className="space-y-2">
                    {urlInputs.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder={`https://example.com/image-${index + 1}.jpg`}
                          value={url}
                          onChange={(e) => handleUrlInputChange(index, e.target.value)}
                          className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                        />
                        {(index < urlInputs.length - 1 || (urlInputs.length > 1 && url.trim())) && (
                          <Button
                            type="button"
                            onClick={() => removeUrlInput(index)}
                            size="sm"
                            variant="destructive"
                            className="p-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-zinc-500 italic">
                      Type in the last field to add another URL
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form fields */}
          <div className="xl:col-span-3 space-y-6">
            {/* Basic information */}
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldGroups.basic.map((field) => (
                    <div key={field}>
                      <label className="text-sm text-zinc-400 mb-2 block">
                        {field.replace(/_/g, " ").charAt(0).toUpperCase() + field.replace(/_/g, " ").slice(1)}
                        {(field === "name" || field === "type") && (
                          <span className="text-red-400 ml-1">*</span>
                        )}
                      </label>
                      {field === "description" ? (
                        <Textarea
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          className="bg-zinc-800/50 border-zinc-700 focus:border-primary min-h-[80px]"
                        />
                      ) : field === "type" ? (
                        <div>
                          {isAddingType ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={newTypeInput}
                                onChange={(e) => setNewTypeInput(e.target.value)}
                                placeholder="Enter new type name"
                                className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                              />
                              <Button
                                type="button"
                                onClick={handleAddType}
                                disabled={isSubmittingType || !newTypeInput.trim()}
                                size="sm"
                              >
                                {isSubmittingType ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Add"
                                )}
                              </Button>
                              <Button
                                type="button"
                                onClick={() => {
                                  setIsAddingType(false);
                                  setNewTypeInput("");
                                }}
                                size="sm"
                                variant="secondary"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <select
                                name={field}
                                value={formData[field]}
                                onChange={handleChange}
                                disabled={isLoadingTypes}
                                className="w-full h-10 px-3 bg-zinc-800/50 border border-zinc-700 rounded-md text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary"
                              >
                                <option value="">Select Type</option>
                                {availableTypes.map((type, index) => (
                                  <option key={index} value={typeof type === 'string' ? type : type.name}>
                                    {typeof type === 'string' ? type : type.label || type.name}
                                  </option>
                                ))}
                              </select>
                              <Button
                                type="button"
                                onClick={() => setIsAddingType(true)}
                                variant="link"
                                size="sm"
                                className="text-xs text-primary hover:text-primary/80 p-0 h-auto mt-1"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add New Type
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Input
                          type="text"
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Prompt Information */}
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Prompt Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4">
                {fieldGroups.prompts.map((field) => (
                  <div key={field}>
                    <label className="text-sm text-zinc-400 mb-2 block">
                      {field.replace(/_/g, " ").charAt(0).toUpperCase() + field.replace(/_/g, " ").slice(1)}
                    </label>
                    <Textarea
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="bg-zinc-800/50 border-zinc-700 focus:border-primary min-h-[80px]"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Generation Settings */}
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {customFieldGroups.generation.map((field) => (
                    <div key={field}>
                      <label className="text-sm text-zinc-400 mb-2 block">
                        {field}
                      </label>
                      <Input
                        type={field === "Steps" || field === "Seed" ? "number" : "text"}
                        value={customFields[field]}
                        onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Model Information */}
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Model Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFieldGroups.model.map((field) => (
                    <div key={field}>
                      <label className="text-sm text-zinc-400 mb-2 block flex items-center gap-2">
                        {field === "Model hash" && <Hash className="w-3 h-3" />}
                        {field}
                      </label>
                      <Input
                        type="text"
                        value={customFields[field]}
                        onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldGroups.technical.map((field) => (
                    <div key={field}>
                      <label className="text-sm text-zinc-400 mb-2 block flex items-center gap-2">
                        {field === "created_at" && <Calendar className="w-3 h-3" />}
                        {field === "nsfw_level" && <Shield className="w-3 h-3" />}
                        {field.replace(/_/g, " ").charAt(0).toUpperCase() + field.replace(/_/g, " ").slice(1)}
                      </label>
                      <Input
                        type={field === "created_at" ? "date" : "text"}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Metadata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldGroups.meta.map((field) => (
                    <div key={field}>
                      <label className="text-sm text-zinc-400 mb-2 block flex items-center gap-2">
                        {field === "creator" && <User className="w-3 h-3" />}
                        {field === "slug" && <Globe className="w-3 h-3" />}
                        {field === "download_url" && <Download className="w-3 h-3" />}
                        {field.replace(/_/g, " ").charAt(0).toUpperCase() + field.replace(/_/g, " ").slice(1)}
                      </label>
                      <Input
                        type="text"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="px-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Asset
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}