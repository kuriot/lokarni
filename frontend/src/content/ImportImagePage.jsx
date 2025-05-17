import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Upload, FileImage, Tag, Settings, Save, CheckCircle, XCircle, 
  Sparkles, Image as ImageIcon, X, Link, Plus
} from "lucide-react";
import { motion } from "framer-motion";

export default function ImportImagePage({ onImportSuccess }) {
  const [uploadItems, setUploadItems] = useState([
    { 
      file: null, 
      url: "", 
      previewUrl: null, 
      metadata: {
        customFields: {},
        positivePrompt: "",
        negativePrompt: "",
        tags: "",
        categorizedFields: {
          generation: {},
          model: {},
          lora: {},
          other: {}
        }
      },
      extractionComplete: false,
      loading: false,
      saving: false,
      error: "",
      success: ""
    }
  ]);
  
  const [civitaiApiKey, setCivitaiApiKey] = useState("");
  const [uploadMethod, setUploadMethod] = useState("file"); // "file" or "url"
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Lade API-Key aus localStorage beim Start
  useEffect(() => {
    const stored = localStorage.getItem("civitai-api-key");
    if (stored) setCivitaiApiKey(stored);
    
    // Setup drag and drop event listeners
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("border-primary");
      };
      
      const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("border-primary");
      };
      
      const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("border-primary");
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const newFiles = Array.from(e.dataTransfer.files).slice(0, 10);
          handleMultipleFiles(newFiles);
        }
      };
      
      dropZone.addEventListener("dragover", handleDragOver);
      dropZone.addEventListener("dragleave", handleDragLeave);
      dropZone.addEventListener("drop", handleDrop);
      
      return () => {
        dropZone.removeEventListener("dragover", handleDragOver);
        dropZone.removeEventListener("dragleave", handleDragLeave);
        dropZone.removeEventListener("drop", handleDrop);
      };
    }
  }, []);

  const handleMultipleFiles = (files) => {
    const newItems = files.map(file => ({
      file,
      url: "",
      previewUrl: URL.createObjectURL(file),
      metadata: {
        customFields: {},
        positivePrompt: "",
        negativePrompt: "",
        tags: "",
        categorizedFields: {
          generation: {},
          model: {},
          lora: {},
          other: {}
        }
      },
      extractionComplete: false,
      loading: false,
      saving: false,
      error: "",
      success: ""
    }));
    
    // Limit to 10 items
    setUploadItems(prev => {
      const combined = [...prev.filter(item => item.file || item.url), ...newItems];
      // If last item has no file and no url, keep it for adding more
      if (!prev[prev.length - 1].file && !prev[prev.length - 1].url) {
        combined.push({
          file: null, 
          url: "", 
          previewUrl: null, 
          metadata: {
            customFields: {},
            positivePrompt: "",
            negativePrompt: "",
            tags: "",
            categorizedFields: {
              generation: {},
              model: {},
              lora: {},
              other: {}
            }
          },
          extractionComplete: false,
          loading: false,
          saving: false,
          error: "",
          success: ""
        });
      }
      return combined.slice(0, 10);
    });
  };

  const handleFileChange = (e, index) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setUploadItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        file: selected,
        url: "",
        previewUrl: URL.createObjectURL(selected),
        metadata: {
          customFields: {},
          positivePrompt: "",
          negativePrompt: "",
          tags: "",
          categorizedFields: {
            generation: {},
            model: {},
            lora: {},
            other: {}
          }
        },
        extractionComplete: false,
        error: "",
        success: "",
      };
      
      // Add a new item if this was the last one and we haven't reached 10 items
      if (index === prev.length - 1 && prev.length < 10) {
        updated.push({
          file: null, 
          url: "", 
          previewUrl: null, 
          metadata: {
            customFields: {},
            positivePrompt: "",
            negativePrompt: "",
            tags: "",
            categorizedFields: {
              generation: {},
              model: {},
              lora: {},
              other: {}
            }
          },
          extractionComplete: false,
          loading: false,
          saving: false,
          error: "",
          success: ""
        });
      }
      
      return updated;
    });
  };

  const handleUrlChange = (url, index) => {
    setUploadItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        file: null,
        url: url,
        previewUrl: url || null,
        metadata: {
          customFields: {},
          positivePrompt: "",
          negativePrompt: "",
          tags: "",
          categorizedFields: {
            generation: {},
            model: {},
            lora: {},
            other: {}
          }
        },
        extractionComplete: false,
        error: "",
        success: "",
      };
      
      // Add a new item if this was the last one and the url is not empty
      if (index === prev.length - 1 && url && prev.length < 10) {
        updated.push({
          file: null, 
          url: "", 
          previewUrl: null, 
          metadata: {
            customFields: {},
            positivePrompt: "",
            negativePrompt: "",
            tags: "",
            categorizedFields: {
              generation: {},
              model: {},
              lora: {},
              other: {}
            }
          },
          extractionComplete: false,
          loading: false,
          saving: false,
          error: "",
          success: ""
        });
      }
      
      return updated;
    });
  };

  const removeItem = (index) => {
    setUploadItems(prev => {
      // Always keep at least one item
      if (prev.length <= 1) {
        return [{
          file: null, 
          url: "", 
          previewUrl: null, 
          metadata: {
            customFields: {},
            positivePrompt: "",
            negativePrompt: "",
            tags: "",
            categorizedFields: {
              generation: {},
              model: {},
              lora: {},
              other: {}
            }
          },
          extractionComplete: false,
          loading: false,
          saving: false,
          error: "",
          success: ""
        }];
      }
      
      // Remove item at index
      return prev.filter((_, i) => i !== index);
    });
  };

  const categorizeMetadata = (metadata) => {
    const categories = {
      generation: {},
      model: {},
      lora: {},
      other: {}
    };

    Object.entries(metadata).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      
      if (lowerKey.includes('steps') || lowerKey.includes('cfg') || lowerKey.includes('scale') || 
          lowerKey.includes('sampler') || lowerKey.includes('scheduler') || lowerKey.includes('seed') ||
          lowerKey.includes('denoise') || lowerKey.includes('size')) {
        categories.generation[key] = value;
      } else if (lowerKey.includes('model') || lowerKey.includes('hash') || lowerKey.includes('version')) {
        categories.model[key] = value;
      } else if (lowerKey.includes('lora')) {
        categories.lora[key] = value;
      } else {
        categories.other[key] = value;
      }
    });

    return categories;
  };

  const handleUpload = async (index) => {
    const item = uploadItems[index];
    if (!item.file && !item.url) return;
    
    setUploadItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        loading: true,
        error: "",
        success: ""
      };
      return updated;
    });

    try {
      let response;
      
      if (uploadMethod === "file" && item.file) {
        const formData = new FormData();
        formData.append("file", item.file);
        
        response = await fetch("http://localhost:8000/api/image/extract-metadata/", {
          method: "POST",
          body: formData,
        });
      } else if (item.url) {
        // URL-basierte Extraktion
        const body = { url: item.url };
        if (civitaiApiKey) {
          body.api_key = civitaiApiKey;
          // Speichere API-Key in localStorage und Cookie
          localStorage.setItem("civitai-api-key", civitaiApiKey);
          document.cookie = `civitai-api-key=${civitaiApiKey};path=/`;
        }
        
        response = await fetch("http://localhost:8000/api/image/extract-metadata-url/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        throw new Error("No file or URL provided");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to extract metadata.");
      }
      
      const data = await response.json();
      const meta = data.metadata;

      // Trenne Prompt-Felder vom Rest
      const { Prompt, "Negative prompt": NegPrompt, ...rest } = meta;
      
      // Kategorisiere die Metadaten
      const categorized = categorizeMetadata(rest);
      
      setUploadItems(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          loading: false,
          extractionComplete: true,
          metadata: {
            customFields: rest,
            positivePrompt: Prompt || "",
            negativePrompt: NegPrompt || "",
            tags: "",
            categorizedFields: categorized
          }
        };
        return updated;
      });
    } catch (err) {
      setUploadItems(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          loading: false,
          error: err.message || "Unknown error"
        };
        return updated;
      });
    }
  };

  const handleCustomFieldChange = (index, category, key, value) => {
    setUploadItems(prev => {
      const updated = [...prev];
      // Update categorized field
      updated[index].metadata.categorizedFields = {
        ...updated[index].metadata.categorizedFields,
        [category]: {
          ...updated[index].metadata.categorizedFields[category],
          [key]: value
        }
      };
      // Update custom fields
      updated[index].metadata.customFields = {
        ...updated[index].metadata.customFields,
        [key]: value
      };
      return updated;
    });
  };

  const handlePromptChange = (index, field, value) => {
    setUploadItems(prev => {
      const updated = [...prev];
      updated[index].metadata[field] = value;
      return updated;
    });
  };

  const handleTagsChange = (index, value) => {
    setUploadItems(prev => {
      const updated = [...prev];
      updated[index].metadata.tags = value;
      return updated;
    });
  };

  const handleImport = async (index) => {
    const item = uploadItems[index];
    
    setUploadItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        saving: true,
        error: "",
        success: ""
      };
      return updated;
    });

    const payload = {
      name: item.file?.name || item.url.split('/').pop() || "Imported Image",
      type: "Image",
      positive_prompt: item.metadata.positivePrompt,
      negative_prompt: item.metadata.negativePrompt,
      tags: item.metadata.tags,
      custom_fields: item.metadata.customFields,
    };

    try {
      let uploadResult;
      
      if (uploadMethod === "file" && item.file) {
        const uploadData = new FormData();
        uploadData.append("file", item.file);
        uploadData.append("type", "Image");
        
        const uploadRes = await fetch("http://localhost:8000/api/upload-image", {
          method: "POST",
          body: uploadData,
        });
        
        if (!uploadRes.ok) throw new Error("File upload failed.");
        uploadResult = await uploadRes.json();
      } else if (item.url) {
        // URL-basiertes Upload
        const uploadRes = await fetch("http://localhost:8000/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: item.url, type: "Image" }),
        });
        
        if (!uploadRes.ok) throw new Error("URL upload failed.");
        uploadResult = await uploadRes.json();
      } else {
        throw new Error("No file or URL provided");
      }

      payload.preview_image = uploadResult.path;
      payload.media_files = [uploadResult.path];
      payload.path = uploadResult.path;

      const saveRes = await fetch("http://localhost:8000/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) throw new Error("Failed to save asset.");
      const saved = await saveRes.json();

      if (onImportSuccess) onImportSuccess(saved);
      
      setUploadItems(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          saving: false,
          success: "Asset wurde erfolgreich gespeichert!"
        };
        return updated;
      });
      
      // Remove saved item after success message
      setTimeout(() => {
        removeItem(index);
      }, 2000);
    } catch (err) {
      setUploadItems(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          saving: false,
          error: err.message || "Unknown error"
        };
        return updated;
      });
    }
  };

  const MetadataSection = ({ index, title, icon, fields, category }) => {
    if (Object.keys(fields).length === 0) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          {icon}
          {title}
        </div>
        <div className="space-y-3">
          {Object.entries(fields).map(([key, value]) => (
            <div key={key}>
              <label className="text-xs text-zinc-500 block mb-1">{key}</label>
              <Input
                value={value}
                onChange={(e) => handleCustomFieldChange(index, category, key, e.target.value)}
                className="h-9 text-sm bg-zinc-800/50 border-zinc-700 focus:border-primary"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Import Images</h1>
        <p className="text-zinc-400">Extract metadata from your AI-generated images and save them as assets</p>
      </div>

      {/* Upload Section */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Images (Max 10)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={uploadMethod} onValueChange={setUploadMethod}>
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger value="file" className="data-[state=active]:bg-zinc-700">
                <FileImage className="w-4 h-4 mr-2" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="data-[state=active]:bg-zinc-700">
                <Link className="w-4 h-4 mr-2" />
                URL Upload
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-4">
              <div 
                ref={dropZoneRef}
                className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-zinc-600 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => handleFileChange(e, 0)}
                  className="hidden"
                  multiple
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
                <p className="text-sm text-zinc-400">Click or drag and drop images here</p>
                <p className="text-xs text-zinc-500 mt-1">PNG files with metadata recommended</p>
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.png or Civitai image URL"
                  value={uploadItems[0].url}
                  onChange={(e) => handleUrlChange(e.target.value, 0)}
                  className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                />
                <Input
                  type="password"
                  placeholder="Civitai API Key (optional)"
                  value={civitaiApiKey}
                  onChange={(e) => setCivitaiApiKey(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                />
                <div className="text-xs text-zinc-500">
                  <p className="font-medium mb-1">Unterstützte Formate:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>PNG-Bilder mit eingebetteten Metadaten</li>
                    <li>Civitai Bilder (mit API Key für beste Ergebnisse)</li>
                    <li>JPEG-Bilder (eingeschränkte Metadaten)</li>
                  </ul>
                  {civitaiApiKey && (
                    <p className="text-green-500 text-xs mt-2">
                      ✓ API Key wird für zukünftige Anfragen gespeichert
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Image Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {uploadItems.map((item, index) => (
          item.previewUrl || (index === 0 && !item.previewUrl) ? (
            <Card key={index} className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="p-4 border-b border-zinc-800">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-5 h-5" />
                    <span className="truncate">{item.file?.name || item.url.split('/').pop() || "New Image"}</span>
                  </div>
                  {(item.file || item.url) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => removeItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {item.previewUrl ? (
                  <div className="relative">
                    <img 
                      src={item.previewUrl} 
                      alt="Preview" 
                      className="w-full object-cover h-48" 
                    />
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 to-transparent p-4">
                      <Button 
                        onClick={() => handleUpload(index)}
                        disabled={item.loading || item.extractionComplete}
                        className="w-full"
                        variant={item.extractionComplete ? "secondary" : "default"}
                        size="sm"
                      >
                        {item.loading ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Extracting...
                          </>
                        ) : item.extractionComplete ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-2" />
                            Metadata Extracted
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 mr-2" />
                            Extract Metadata
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Empty state for the first item if no preview
                  <div className="h-48 flex items-center justify-center bg-zinc-800/30">
                    {uploadMethod === "file" ? (
                      <p className="text-center text-zinc-500 text-sm px-6">
                        Click the upload area above to select an image
                      </p>
                    ) : (
                      <p className="text-center text-zinc-500 text-sm px-6">
                        Enter an image URL above
                      </p>
                    )}
                  </div>
                )}

                {item.error && (
                  <Alert className="m-4 border-red-900 bg-red-950/50">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{item.error}</AlertDescription>
                  </Alert>
                )}

                {item.success && (
                  <Alert className="m-4 border-green-900 bg-green-950/50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{item.success}</AlertDescription>
                  </Alert>
                )}

                {item.extractionComplete && (
                  <div className="p-4 space-y-6">
                    {/* Prompts */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-primary flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Prompts & Tags
                      </h3>
                      
                      <div>
                        <label className="text-xs text-zinc-500 block mb-1">Positive Prompt</label>
                        <Textarea
                          placeholder="Enter positive prompt..."
                          value={item.metadata.positivePrompt}
                          onChange={(e) => handlePromptChange(index, "positivePrompt", e.target.value)}
                          className="min-h-[80px] bg-zinc-800/50 border-zinc-700 focus:border-primary text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-zinc-500 block mb-1">Negative Prompt</label>
                        <Textarea
                          placeholder="Enter negative prompt..."
                          value={item.metadata.negativePrompt}
                          onChange={(e) => handlePromptChange(index, "negativePrompt", e.target.value)}
                          className="min-h-[60px] bg-zinc-800/50 border-zinc-700 focus:border-primary text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-zinc-500 block mb-1">Tags (comma separated)</label>
                        <Input
                          placeholder="e.g. girl, portrait, highres"
                          value={item.metadata.tags}
                          onChange={(e) => handleTagsChange(index, e.target.value)}
                          className="bg-zinc-800/50 border-zinc-700 focus:border-primary text-sm"
                        />
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-primary flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        Extracted Metadata
                      </h3>
                      
                      <div className="space-y-4">
                        <MetadataSection
                          index={index}
                          title="Generation Settings"
                          icon={<ImageIcon className="w-3 h-3" />}
                          fields={item.metadata.categorizedFields.generation}
                          category="generation"
                        />
                        
                        <MetadataSection
                          index={index}
                          title="Model Information"
                          icon={<Sparkles className="w-3 h-3" />}
                          fields={item.metadata.categorizedFields.model}
                          category="model"
                        />
                        
                        {Object.keys(item.metadata.categorizedFields.lora).length > 0 && (
                          <MetadataSection
                            index={index}
                            title="LoRA Settings"
                            icon={<Settings className="w-3 h-3" />}
                            fields={item.metadata.categorizedFields.lora}
                            category="lora"
                          />
                        )}
                        
                        {Object.keys(item.metadata.categorizedFields.other).length > 0 && (
                          <MetadataSection
                            index={index}
                            title="Other Metadata"
                            icon={<Tag className="w-3 h-3" />}
                            fields={item.metadata.categorizedFields.other}
                            category="other"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Save Button */}
                    <Button
                      onClick={() => handleImport(index)}
                      disabled={item.saving}
                      className="w-full"
                    >
                      {item.saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving Asset...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save as Asset
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null
        ))}
        
        {/* Add more images button */}
        {uploadItems.filter(item => item.file || item.url).length < 10 && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="border-dashed border-zinc-700 bg-transparent h-full cursor-pointer hover:border-primary transition-colors flex items-center justify-center"
              onClick={() => {
                if (uploadMethod === "file") {
                  fileInputRef.current?.click();
                } else {
                  setUploadItems(prev => [...prev, {
                    file: null, 
                    url: "", 
                    previewUrl: null, 
                    metadata: {
                      customFields: {},
                      positivePrompt: "",
                      negativePrompt: "",
                      tags: "",
                      categorizedFields: {
                        generation: {},
                        model: {},
                        lora: {},
                        other: {}
                      }
                    },
                    extractionComplete: false,
                    loading: false,
                    saving: false,
                    error: "",
                    success: ""
                  }]);
                }
              }}
            >
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Plus className="w-12 h-12 text-zinc-600 mb-2" />
                <p className="text-zinc-400">Add {uploadMethod === "file" ? "Image" : "URL"}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}