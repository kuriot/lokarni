import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import AssetGrid from "./components/AssetGrid";
import AssetModal from "./components/AssetModal";
import { LayoutGrid, Columns, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import AddContent from "./content/AddContent";
import ManageContent from "./content/ManageContent";
import SettingsContent from "./content/SettingsContent";
import SearchContent from "./content/SearchContent";

export default function App() {
  const [category, setCategory] = useState("All Assets");
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [layout, setLayout] = useState(() => {
    return localStorage.getItem("lokarni-grid-layout") || "grid";
  });
  const [showNSFW, setShowNSFW] = useState(() => {
    return localStorage.getItem("lokarni-show-nsfw") === "true";
  });

  const fetchAssets = () => {
    let params = [];

    if (category === "Favorites") {
      params.push("favorite=true");
    } else if (
      category !== "All Assets" &&
      !["Add", "Manage", "Settings", "Search"].includes(category)
    ) {
      params.push(`category=${encodeURIComponent(category)}`);
    }
    
    // Add NSFW filter parameter
    if (!showNSFW) {
      params.push("nsfw_filter=true");
    }
    
    const queryString = params.length > 0 ? `?${params.join("&")}` : "";

    fetch(`http://localhost:8000/api/assets${queryString}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server response was not OK");
        return res.json();
      })
      .then((data) => setAssets(Array.isArray(data) ? data : []))
      .catch((err) =>
        console.error("Error loading assets:", err.message)
      );
  };

  useEffect(() => {
    if (!["Add", "Manage", "Settings", "Search"].includes(category)) {
      fetchAssets();
    }
  }, [category, showNSFW]);

  useEffect(() => {
    localStorage.setItem("lokarni-grid-layout", layout);
  }, [layout]);
  
  useEffect(() => {
    localStorage.setItem("lokarni-show-nsfw", showNSFW.toString());
  }, [showNSFW]);

  const handleUpdate = () => {
    fetchAssets();
    setSelectedAsset(null);
  };

  const toggleLayout = () => {
    setLayout((prev) => (prev === "grid" ? "masonry" : "grid"));
  };
  
  const toggleNSFW = () => {
    setShowNSFW((prev) => !prev);
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar onSelectCategory={setCategory} />
        
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold"
                >
                  {category}
                </motion.h1>
                {!["Add", "Manage", "Settings", "Search"].includes(category) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="text-sm text-muted-foreground">
                      {assets.length} items
                    </span>
                  </motion.div>
                )}
              </div>

              {!["Add", "Manage", "Settings", "Search"].includes(category) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  {/* Layout Toggle */}
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          pressed={layout === "grid"}
                          onPressedChange={() => setLayout("grid")}
                          className={cn(
                            "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          )}
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Grid Layout</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          pressed={layout === "masonry"}
                          onPressedChange={() => setLayout("masonry")}
                          className={cn(
                            "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          )}
                        >
                          <Columns className="w-4 h-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Masonry Layout</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* NSFW Content Toggle */}
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          pressed={showNSFW}
                          onPressedChange={toggleNSFW}
                          className={cn(
                            "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          )}
                        >
                          {showNSFW ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{showNSFW ? "Hide NSFW Content" : "Show NSFW Content"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </motion.div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {category === "Add" && <AddContent />}
            {category === "Manage" && <ManageContent />}
            {category === "Settings" && <SettingsContent />}
            {category === "Search" && <SearchContent />}

            {!["Add", "Manage", "Settings", "Search"].includes(category) && (
              <>
                <AssetGrid
                  assets={assets}
                  setAssets={setAssets}
                  onSelect={setSelectedAsset}
                  onlyFavorites={category === "Favorites"}
                  category={category}
                  layout={layout}
                  showNSFW={showNSFW}
                />
                
                {selectedAsset && (
                  <AssetModal
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                    onUpdate={handleUpdate}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}