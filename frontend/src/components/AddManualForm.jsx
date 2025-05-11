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
  const [urlInputs, setUrlInputs] = useState([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  
  // States for adding new types
  const [newTypeInput, setNewTypeInput] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);
  const [isSubmittingType, setIsSubmittingType] = useState(false);

  // Load available types from database when component mounts
  useEffect(() => {
    fetchAvailableTypes();
  }, []);

  const fetchAvailableTypes = async () => {
    setIsLoadingTypes(true);
    try {
      // Make API call to your backend to get available types
      const response = await fetch("http://localhost:8000/api/asset-types");
      
      if (response.ok) {
        const data = await response.json();
        setAvailableTypes(data);
      } else {
        console.error("Failed to load asset types");
        // Fallback to default types if API call fails
        setAvailableTypes([
          "Checkpoint", "LoRA", "Embedding", "Controlnet", 
          "Poses", "Wildcards", "LyCORIS", "Hypernetwork", "Other"
        ]);
      }
    } catch (error) {
      console.error("Error fetching asset types:", error);
      // Fallback to default types if API call fails
      setAvailableTypes([
        "Checkpoint", "LoRA", "Embedding", "Controlnet", 
        "Poses", "Wildcards", "LyCORIS", "Hypernetwork", "Other"
      ]);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  // Function to add a new type
  const handleAddType = async () => {
    if (!newTypeInput.trim()) return;
    
    setIsSubmittingType(true);
    try {
      const response = await fetch("http://localhost:8000/api/asset-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeInput.trim() })
      });
      
      if (response.ok) {
        const updatedTypes = await response.json();
        setAvailableTypes(updatedTypes);
        setFormData(prev => ({ ...prev, type: newTypeInput.trim() }));
        setNewTypeInput("");
        setIsAddingType(false);
      } else {
        console.error("Failed to add new type");
      }
    } catch (error) {
      console.error("Error adding new type:", error);
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

  const handleMediaUpload = (e) => {
    setMediaFiles([...e.target.files]);
  };

  const handleUrlInputChange = (index, value) => {
    setUrlInputs((prev) => {
      const updated = [...prev];
      updated[index] = value;
      
      // If we're editing the last input and it has content, add a new empty input
      if (index === updated.length - 1 && value.trim()) {
        updated.push("");
      }
      
      return updated;
    });
  };

  // Remove a URL input field
  const removeUrlInput = (index) => {
    setUrlInputs(prev => {
      // Don't remove if it's the last empty one
      if (prev.length === 1 && !prev[0]) {
        return prev;
      }
      
      const updated = [...prev];
      updated.splice(index, 1);
      
      // Ensure we always have at least one field
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

    // Validate required fields
    if (!formData.name || !formData.type) {
      setFormError("Name and type are required");
      setIsSubmitting(false);
      return;
    }

    let media_files = [];
    let preview_image_path = "";

    try {
      // Local file uploads
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

      // URL uploads - only process non-empty URLs
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
        setMediaFiles([]);
        setPreviewUrls([]);
        setUrlInputs([""]);
        setFormSuccess("Asset saved successfully!");
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

  return (
    <div className="bg-zinc-950 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-800">
        <h2 className="text-2xl font-bold text-primary">Add New Asset</h2>
        <p className="text-zinc-400 mt-1">Create a new entry with detailed information and media</p>
      </div>

      {(formError || formSuccess) && (
        <div className={`mx-6 mt-4 p-4 rounded ${formError ? 'bg-red-900/30 border border-red-700' : 'bg-green-900/30 border border-green-700'}`}>
          <p className={`text-sm ${formError ? 'text-red-400' : 'text-green-400'}`}>
            {formError || formSuccess}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Media upload section - Full width on mobile, 1/3 on desktop */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
              <div className="bg-zinc-800 p-4 border-b border-zinc-700">
                <h3 className="text-primary font-bold flex items-center">
                  <span className="mr-2">📷</span> Media Files
                </h3>
              </div>
              <div className="p-4 space-y-6">
                {/* Local file upload */}
                <div>
                  <label className="block text-sm text-white font-medium mb-2">Upload Images/Videos</label>
                  <div className={`border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center hover:border-primary transition-colors ${mediaFiles.length > 0 ? 'bg-zinc-800' : 'bg-zinc-900'}`}>
                    {previewUrls.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {previewUrls.map((url, idx) =>
                          mediaFiles[idx]?.type?.startsWith("video/") ? (
                            <video key={idx} src={url} controls className="w-full h-32 object-cover rounded border border-zinc-700" />
                          ) : (
                            <img key={idx} src={url} alt="Preview" className="w-full h-32 object-cover rounded border border-zinc-700" />
                          )
                        )}
                      </div>
                    ) : (
                      <div className="py-6">
                        <svg className="mx-auto h-12 w-12 text-zinc-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8m36-12h-4m4 0H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm text-zinc-400">
                          Drag and drop files, or click to select
                        </p>
                      </div>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="w-full text-sm text-zinc-400 file:bg-primary file:text-zinc-900 file:font-medium file:border-none file:px-4 file:py-2 file:rounded file:mr-4 file:hover:bg-yellow-400 file:transition-colors"
                    />
                  </div>
                </div>

                {/* URL inputs */}
                <div>
                  <label className="block text-sm text-white font-medium mb-2">Media URLs</label>
                  <div className="space-y-2">
                    {urlInputs.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`https://example.com/media-${index + 1}.jpg`}
                          value={url}
                          onChange={(e) => handleUrlInputChange(index, e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm placeholder:text-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                        {/* Show remove button for all but the last field */}
                        {(index < urlInputs.length - 1 || (urlInputs.length > 1 && url.trim())) && (
                          <button
                            type="button"
                            onClick={() => removeUrlInput(index)}
                            className="p-2 bg-red-900 hover:bg-red-800 text-white rounded-md text-sm transition-colors"
                            aria-label="Remove URL"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-zinc-500 italic mt-1">
                      Type in the last field to add another URL
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form fields - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic information */}
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
              <div className="bg-zinc-800 p-4 border-b border-zinc-700">
                <h3 className="text-primary font-bold flex items-center">
                  <span className="mr-2">📋</span> Basic Information
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldGroups.basic.map((field) => (
                  <div key={field} className="space-y-1">
                    <label className="block text-sm font-medium text-zinc-300 capitalize">
                      {field.replace(/_/g, " ")}
                      {field === "name" || field === "type" ? (
                        <span className="text-red-400 ml-1">*</span>
                      ) : null}
                    </label>
                    {field === "description" ? (
                      <textarea
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-none min-h-[80px]"
                      />
                    ) : field === "type" ? (
                      <div>
                        {isAddingType ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newTypeInput}
                                onChange={(e) => setNewTypeInput(e.target.value)}
                                placeholder="Enter new type name"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                              />
                              <button
                                type="button"
                                onClick={handleAddType}
                                disabled={isSubmittingType || !newTypeInput.trim()}
                                className={`p-2 bg-primary text-zinc-900 rounded-md text-sm transition-colors flex items-center ${isSubmittingType || !newTypeInput.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400'}`}
                              >
                                {isSubmittingType ? (
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  "Add"
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingType(false);
                                  setNewTypeInput("");
                                }}
                                className="p-2 bg-zinc-700 text-white rounded-md text-sm hover:bg-zinc-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <select
                              name={field}
                              value={formData[field]}
                              onChange={handleChange}
                              disabled={isLoadingTypes}
                              className={`w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary ${isLoadingTypes ? 'cursor-wait opacity-70' : ''}`}
                            >
                              <option value="">Select Type</option>
                              {isLoadingTypes ? (
                                <option value="" disabled>Loading types...</option>
                              ) : (
                                availableTypes.map((type, index) => (
                                  <option key={index} value={typeof type === 'string' ? type : type.name || type.value}>
                                    {typeof type === 'string' ? type : type.label || type.name || type.value}
                                  </option>
                                ))
                              )}
                            </select>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => setIsAddingType(true)}
                                className="text-xs text-primary hover:text-yellow-400 transition-colors"
                              >
                                + Add New Type
                              </button>
                            </div>
                            {isLoadingTypes && (
                              <div className="mt-1 flex items-center">
                                <svg className="animate-spin h-4 w-4 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-xs text-zinc-500">Loading available types...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Prompt Information */}
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
              <div className="bg-zinc-800 p-4 border-b border-zinc-700">
                <h3 className="text-primary font-bold flex items-center">
                  <span className="mr-2">💬</span> Prompt Information
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 gap-4">
                {fieldGroups.prompts.map((field) => (
                  <div key={field} className="space-y-1">
                    <label className="block text-sm font-medium text-zinc-300 capitalize">
                      {field.replace(/_/g, " ")}
                    </label>
                    <textarea
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-none min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Details */}
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
              <div className="bg-zinc-800 p-4 border-b border-zinc-700">
                <h3 className="text-primary font-bold flex items-center">
                  <span className="mr-2">⚙️</span> Technical Details
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldGroups.technical.map((field) => (
                  <div key={field} className="space-y-1">
                    <label className="block text-sm font-medium text-zinc-300 capitalize">
                      {field.replace(/_/g, " ")}
                    </label>
                    <input
                      type={field === "created_at" ? "date" : "text"}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
              <div className="bg-zinc-800 p-4 border-b border-zinc-700">
                <h3 className="text-primary font-bold flex items-center">
                  <span className="mr-2">🔖</span> Metadata
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldGroups.meta.map((field) => (
                  <div key={field} className="space-y-1">
                    <label className="block text-sm font-medium text-zinc-300 capitalize">
                      {field.replace(/_/g, " ")}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 bg-primary text-zinc-900 rounded-md font-bold hover:bg-yellow-400 transition-colors flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <span className="mr-2">💾</span> Save Asset
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}