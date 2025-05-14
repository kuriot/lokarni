import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, FileImage, Tag, Settings, Save, CheckCircle, XCircle, Sparkles, Image, X, Link } from "lucide-react";

export default function ImportImagePage({ onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [civitaiApiKey, setCivitaiApiKey] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("file"); // "file" or "url"

  const [customFields, setCustomFields] = useState({});
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [tags, setTags] = useState("");

  // Kategorisierte Metadaten
  const [categorizedFields, setCategorizedFields] = useState({
    generation: {},
    model: {},
    lora: {},
    other: {}
  });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setImageUrl("");
      resetForm();
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url) {
      setPreviewUrl(url);
      setFile(null);
      resetForm();
    } else {
      setPreviewUrl(null);
    }
  };

  const resetForm = () => {
    setCustomFields({});
    setCategorizedFields({ generation: {}, model: {}, lora: {}, other: {} });
    setPositivePrompt("");
    setNegativePrompt("");
    setTags("");
    setError("");
    setSuccess("");
    setExtractionComplete(false);
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

  const handleUpload = async () => {
    if (!file && !imageUrl) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let response;
      
      if (uploadMethod === "file") {
        const formData = new FormData();
        formData.append("file", file);
        
        response = await fetch("http://localhost:8000/api/image/extract-metadata/", {
          method: "POST",
          body: formData,
        });
      } else {
        // URL-basierte Extraktion
        const body = { url: imageUrl };
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
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to extract metadata.");
      }
      const data = await response.json();
      const meta = data.metadata;

      // Trenne Prompt-Felder vom Rest
      const { Prompt, "Negative prompt": NegPrompt, ...rest } = meta;
      setPositivePrompt(Prompt || "");
      setNegativePrompt(NegPrompt || "");
      
      // Kategorisiere die Metadaten
      const categorized = categorizeMetadata(rest);
      setCategorizedFields(categorized);
      setCustomFields(rest);
      
      setExtractionComplete(true);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomFieldChange = (category, key, value) => {
    setCategorizedFields(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }));
    setCustomFields(prev => ({ ...prev, [key]: value }));
  };

  const handleImport = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      name: file?.name || imageUrl.split('/').pop() || "Imported Image",
      type: "Image",
      positive_prompt: positivePrompt,
      negative_prompt: negativePrompt,
      tags: tags,
      custom_fields: customFields,
    };

    try {
      let uploadResult;
      
      if (uploadMethod === "file") {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("type", "Image");
        
        const uploadRes = await fetch("http://localhost:8000/api/upload-image", {
          method: "POST",
          body: uploadData,
        });
        
        if (!uploadRes.ok) throw new Error("File upload failed.");
        uploadResult = await uploadRes.json();
      } else {
        // URL-basiertes Upload
        const uploadRes = await fetch("http://localhost:8000/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageUrl, type: "Image" }),
        });
        
        if (!uploadRes.ok) throw new Error("URL upload failed.");
        uploadResult = await uploadRes.json();
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
      setSuccess("Asset wurde erfolgreich gespeichert!");
      
      // Reset nach erfolgreichem Import
      setTimeout(() => {
        resetForm();
        setFile(null);
        setImageUrl("");
        setPreviewUrl(null);
      }, 2000);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  // Lade API-Key aus localStorage beim Start
  useEffect(() => {
    const stored = localStorage.getItem("civitai-api-key");
    if (stored) setCivitaiApiKey(stored);
  }, []);

  const MetadataSection = ({ title, icon, fields, category }) => {
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
                onChange={(e) => handleCustomFieldChange(category, key, e.target.value)}
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
        <h1 className="text-3xl font-bold text-white mb-2">Import Image</h1>
        <p className="text-zinc-400">Extract metadata from your AI-generated images and save them as assets</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Upload Section */}
        <div className="xl:col-span-1">
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={uploadMethod} onValueChange={setUploadMethod}>
                <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                  <TabsTrigger value="file" className="data-[state=active]:bg-zinc-700">
                    <FileImage className="w-4 h-4 mr-2" />
                    File
                  </TabsTrigger>
                  <TabsTrigger value="url" className="data-[state=active]:bg-zinc-700">
                    <Link className="w-4 h-4 mr-2" />
                    URL
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="file" className="space-y-4">
                  {!previewUrl && (
                    <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center hover:border-zinc-600 transition-colors">
                      <Input
                        type="file"
                        accept="image/png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <FileImage className="w-12 h-12 mx-auto mb-2 text-zinc-500" />
                        <p className="text-sm text-zinc-400">Click to upload PNG image</p>
                        <p className="text-xs text-zinc-500 mt-1">Only PNG files with metadata supported</p>
                      </label>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.png"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                  />
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Civitai API Key (optional)"
                      value={civitaiApiKey}
                      onChange={(e) => setCivitaiApiKey(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                    />
                    <div className="space-y-2 text-xs text-zinc-500">
                      <p>Unterstützte Formate:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>PNG-Bilder mit eingebetteten Metadaten</li>
                        <li>Civitai Bilder (mit API Key für beste Ergebnisse)</li>
                      </ul>
                      <p className="text-yellow-500 mt-2">
                        ⚠️ Civitai API Key empfohlen für vollständige Metadaten
                      </p>
                      {civitaiApiKey && (
                        <p className="text-green-500 text-xs">
                          ✓ API Key wird für zukünftige Anfragen gespeichert
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {previewUrl && (
                <div className="relative rounded-lg overflow-hidden shadow-xl">
                  <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                  <button
                    onClick={() => {
                      setFile(null);
                      setImageUrl("");
                      setPreviewUrl(null);
                      resetForm();
                    }}
                    className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5 hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/50 backdrop-blur-sm">
                      {file?.name || imageUrl.split('/').pop()}
                    </Badge>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={(!file && !imageUrl) || loading}
                className="w-full relative"
                variant={extractionComplete ? "secondary" : "default"}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting Metadata...
                  </>
                ) : extractionComplete ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Metadata Extracted
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extract Metadata
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Section - bleibt gleich */}
        <div className="xl:col-span-3 space-y-6">
          {/* Prompts */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Positive Prompt</label>
                <Textarea
                  placeholder="Enter positive prompt..."
                  value={positivePrompt}
                  onChange={(e) => setPositivePrompt(e.target.value)}
                  className="min-h-[100px] bg-zinc-800/50 border-zinc-700 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Negative Prompt</label>
                <Textarea
                  placeholder="Enter negative prompt..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="min-h-[80px] bg-zinc-800/50 border-zinc-700 focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g. girl, portrait, highres"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
              />
              <p className="text-xs text-zinc-500 mt-2">Separate tags with commas</p>
            </CardContent>
          </Card>

          {/* Metadata Sections */}
          {extractionComplete && (
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Extracted Metadata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  <MetadataSection
                    title="Generation Settings"
                    icon={<Image className="w-4 h-4" />}
                    fields={categorizedFields.generation}
                    category="generation"
                  />
                  <MetadataSection
                    title="Model Information"
                    icon={<Sparkles className="w-4 h-4" />}
                    fields={categorizedFields.model}
                    category="model"
                  />
                  {Object.keys(categorizedFields.lora).length > 0 && (
                    <MetadataSection
                      title="LoRA Settings"
                      icon={<Settings className="w-4 h-4" />}
                      fields={categorizedFields.lora}
                      category="lora"
                    />
                  )}
                  {Object.keys(categorizedFields.other).length > 0 && (
                    <MetadataSection
                      title="Other Metadata"
                      icon={<Tag className="w-4 h-4" />}
                      fields={categorizedFields.other}
                      category="other"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages & Save Button */}
          <div className="space-y-4">
            {error && (
              <Alert className="border-red-900 bg-red-950/50">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="border-green-900 bg-green-950/50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={handleImport}
              disabled={!extractionComplete || saving}
              size="lg"
              className="w-full"
            >
              {saving ? (
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
        </div>
      </div>
    </div>
  );
}