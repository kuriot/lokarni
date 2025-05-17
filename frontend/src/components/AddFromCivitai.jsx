import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Key, AlertCircle, CheckCircle, XCircle, LinkIcon, Database, Info } from "lucide-react";

export default function AddFromCivitai() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("civitai-api-key");
    if (stored) setApiKey(stored);
  }, []);

  const handleImport = async () => {
    setMessage("");
    setImportResult(null);
    setLoading(true);

    // Log the request details for debugging
    console.log("Importing from URL:", url);
    console.log("API Key present:", !!apiKey);

    try {
      let endpoint;
      let payload;
      let method = "post";

      if (url.includes("/images/")) {
        // For image imports
        const imageId = url.split("/images/")[1].split("?")[0];
        console.log("Detected image import with ID:", imageId);
        endpoint = `/api/import/from-civitai-image/${imageId}`;
        payload = {};
      } else {
        // For model imports
        console.log("Attempting model import");
        endpoint = "/api/import/from-civitai";
        payload = { civitai_url: url, api_key: apiKey || null };
      }

      console.log("Using endpoint:", endpoint);
      console.log("Payload:", payload);

      // Set cookies before the request
      if (apiKey) {
        localStorage.setItem("civitai-api-key", apiKey);
        document.cookie = `civitai-api-key=${apiKey};path=/`;
        console.log("Set API key in cookie and localStorage");
      }

      // Make the request with detailed error handling
      const response = await axios({
        method,
        url: endpoint,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Lokarni-Frontend/1.0",
          ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {})
        }
      });

      console.log("Import successful, response:", response.data);
      setMessage("Successfully imported!");
      setImportResult(response.data);
    } catch (error) {
      console.error("Import failed:", error);
      
      // More detailed error reporting
      let errorMessage = "Unknown error occurred";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        errorMessage = error.response.data?.detail || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        errorMessage = "No response received from server";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const metadataFields = [
    ["name", "model_data.name", "Name of the model"],
    ["type", "model_data.type", "Model type (Checkpoint, LoRA, etc.)"],
    ["description", "model_data.description", "Model description"],
    ["model_version", "version.name", "Version name"],
    ["trigger_words", "version.trainedWords[]", "Trained trigger words"],
    ["preview_image", "images[0].url", "Preview image URL"],
    ["positive_prompt", "images[0].meta.prompt", "Positive prompt"],
    ["negative_prompt", "images[0].meta.negativePrompt", "Negative prompt"],
    ["tags", "model_data.tags[]", "Tags"],
    ["used_resources", "images[0].resources[]", "Used resources"],
    ["slug", "model_data.slug", "Slug (speaking URL part)"],
    ["creator", "model_data.creator.username", "Creator of the model"],
    ["nsfw", "model_data.nsfw", "NSFW level"],
    ["base_model", "version.baseModel", "Base model (e.g. SDXL)"],
    ["created_at", "version.createdAt", "Creation date"],
    ["download_url", "version.files[0].downloadUrl", "Download link of the model"],
  ];

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Import from CivitAI</h1>
        <p className="text-zinc-400">Import models and resources directly from CivitAI platform</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Import Section */}
        <div className="xl:col-span-1">
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Import Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  CivitAI URL
                </label>
                <Input
                  type="text"
                  placeholder="https://civitai.com/models/1234567"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                />
                <div className="mt-2 flex items-start gap-2 text-xs text-yellow-500/80">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Supported formats:
                    <ul className="mt-1 ml-3">
                      <li>• https://civitai.com/models/12345/model-name</li>
                      <li>• https://civitai.com/images/12345</li>
                    </ul>
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key (Optional)
                </label>
                <Input
                  type="password"
                  placeholder="Enter your CivitAI API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 focus:border-primary"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Create an API key at{" "}
                  <a
                    href="https://civitai.com/user/account"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    civitai.com/account
                  </a>
                  . Required for NSFW content.
                </p>
              </div>

              <Button
                onClick={handleImport}
                disabled={!url || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import Model
                  </>
                )}
              </Button>

              {message && (
                <Alert
                  className={`${
                    message === "Successfully imported!"
                      ? "border-green-900 bg-green-950/50"
                      : "border-red-900 bg-red-950/50"
                  }`}
                >
                  {message === "Successfully imported!" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {importResult && (
                <Card className="border-zinc-800 bg-zinc-900/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Imported Asset</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-300 font-medium">{importResult.name}</p>
                    {importResult.type && (
                      <Badge className="mt-2" variant="secondary">
                        {importResult.type}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata Information */}
        <div className="xl:col-span-2">
          <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Available Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-start gap-2 text-sm text-zinc-400">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  The following metadata fields are automatically extracted from CivitAI when importing models:
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="px-3 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Field
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        API Source
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {metadataFields.map(([field, source, desc]) => (
                      <tr key={field} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-3 py-3 font-mono text-primary text-sm">
                          {field}
                        </td>
                        <td className="px-3 py-3 text-zinc-400 text-sm font-mono">
                          {source}
                        </td>
                        <td className="px-3 py-3 text-zinc-300 text-sm">
                          {desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}