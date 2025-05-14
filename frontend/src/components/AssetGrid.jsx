import { useRef, useState } from "react";
import { Star, Play, LayoutGrid, Columns } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AssetGrid({ 
  assets, 
  onSelect, 
  setAssets, 
  onlyFavorites = false, 
  category = null, 
  layout = "masonry" 
}) {
  const [hoveredId, setHoveredId] = useState(null);
  
  const isVideo = (path) => path?.endsWith(".webm") || path?.endsWith(".mp4");
  const isImage = (path) => path?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  const toggleFavorite = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/assets/${id}/favorite`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to toggle favorite");

      const updatedAsset = await response.json();

      setAssets((prev) => {
        if ((onlyFavorites || category === "Favorites") && !updatedAsset.is_favorite) {
          return prev.filter((item) => item.id !== id);
        } else {
          return prev.map((item) => (item.id === id ? updatedAsset : item));
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getPreviewPath = (asset) => {
    if (asset.preview_image) return asset.preview_image;

    const files = asset.media_files || [];
    const firstMedia = files.find((f) => isImage(f) || isVideo(f));
    return firstMedia || null;
  };

  const filteredAssets =
    category === "Favorites"
      ? assets.filter((asset) => asset.is_favorite)
      : category === "All Assets"
      ? assets
      : onlyFavorites
      ? assets.filter((asset) => asset.is_favorite)
      : assets;

  const getGridClass = () => {
    if (layout === "grid") {
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6";
    }
    if (layout === "masonry") {
      return "columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-6 space-y-6";
    }
    return "grid grid-cols-1 gap-6";
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -8,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className={cn(getGridClass(), "px-2 transition-all duration-300")}>
      <AnimatePresence mode="wait">
        {filteredAssets.map((asset, index) => {
          const previewPath = getPreviewPath(asset);
          const fullPath = previewPath ? `http://localhost:8000${previewPath}` : null;

          return (
            <motion.div
              key={asset.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onHoverStart={() => setHoveredId(asset.id)}
              onHoverEnd={() => setHoveredId(null)}
              className={cn(
                "relative group cursor-pointer",
                layout === "masonry" && "break-inside-avoid"
              )}
              onClick={() => onSelect(asset)}
            >
              <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:border-primary/30">
                <div className="relative">
                  {/* Favorite Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(asset.id);
                        }}
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "absolute top-3 left-3 z-20 bg-black/50 backdrop-blur-sm hover:bg-black/70",
                          asset.is_favorite && "text-yellow-400"
                        )}
                      >
                        <Star
                          className="w-4 h-4"
                          fill={asset.is_favorite ? "currentColor" : "none"}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{asset.is_favorite ? "Remove from favorites" : "Add to favorites"}</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Type Badge */}
                  <Badge
                    variant="secondary"
                    className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-sm"
                  >
                    {asset.type}
                  </Badge>

                  {/* Media Preview */}
                  <div className="relative overflow-hidden">
                    {isVideo(previewPath) ? (
                      <>
                        <VideoHoverPreview src={fullPath} asset={asset} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <Play className="w-12 h-12 text-white/80 drop-shadow-2xl" />
                        </div>
                      </>
                    ) : (
                      <motion.img
                        src={fullPath || "/fallback.jpg"}
                        alt={asset.name}
                        className={cn(
                          "w-full object-cover bg-accent/10",
                          layout === "grid" ? "aspect-[9/16]" : "max-h-[500px]"
                        )}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    
                    {/* Hover Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredId === asset.id ? 1 : 0 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
                    />
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {asset.name}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="truncate">{asset.base_model}</span>
                    {asset.is_favorite && (
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function VideoHoverPreview({ src, asset }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        preload="metadata"
        playsInline
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "w-full aspect-[9/16] object-cover bg-accent/10 transition-transform duration-300",
          isPlaying && "scale-105"
        )}
      />
    </div>
  );
}