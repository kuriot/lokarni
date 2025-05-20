import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Star, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssetGrid({ 
  assets, 
  onSelect, 
  setAssets, 
  onlyFavorites = false, 
  category = null, 
  layout = "masonry" 
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 50;
  
  // Set up intersection observer
  const [visibleAssets, setVisibleAssets] = useState({});
  const observerRef = useRef(null);
  
  // Setup intersection observer
  useEffect(() => {
    // Create observer instance
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Process entries and update visibility state
        const updatedVisibility = {};
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.assetId;
            if (id) {
              updatedVisibility[id] = true;
            }
          }
        });
        
        if (Object.keys(updatedVisibility).length > 0) {
          setVisibleAssets(prev => ({
            ...prev,
            ...updatedVisibility
          }));
        }
      },
      {
        rootMargin: '200px 0px', // Load assets before they come into view
        threshold: 0.01
      }
    );
    
    // Cleanup observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Reset visibility state when data changes
  useEffect(() => {
    setVisibleAssets({});
  }, [assets, currentPage, category, onlyFavorites]);
  
  // Set up loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [assets, category, onlyFavorites]);

  // Reset pagination when filtering changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, onlyFavorites]);
  
  // Scroll to top on initial load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Utility functions
  const isVideo = useCallback((path) => 
    path?.endsWith(".webm") || path?.endsWith(".mp4"), []);
    
  const isImage = useCallback((path) => 
    path?.match(/\.(jpg|jpeg|png|gif|webp)$/i), []);

  const toggleFavorite = useCallback(async (id, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
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
  }, [setAssets, onlyFavorites, category]);

  const getPreviewPath = useCallback((asset) => {
    if (asset.preview_image) return asset.preview_image;

    const files = asset.media_files || [];
    const firstMedia = files.find((f) => isImage(f) || isVideo(f));
    return firstMedia || null;
  }, [isImage, isVideo]);

  // Filter and sort assets
  const processedAssets = useMemo(() => {
    // Filter assets based on category
    const filtered = category === "Favorites"
      ? assets.filter((asset) => asset.is_favorite)
      : category === "All Assets"
      ? assets
      : onlyFavorites
      ? assets.filter((asset) => asset.is_favorite)
      : assets;
        
    // Sort assets - newest first (assuming higher IDs are newer)
    return [...filtered].sort((a, b) => b.id - a.id);
  }, [assets, category, onlyFavorites]);
  
  // Calculate pagination
  const { paginatedAssets, totalPages, startIndex, totalCount } = useMemo(() => {
    const totalCount = processedAssets.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAssets = processedAssets.slice(startIndex, startIndex + itemsPerPage);
    
    return {
      paginatedAssets,
      totalPages,
      startIndex,
      totalCount
    };
  }, [processedAssets, currentPage, itemsPerPage]);

  // Navigation functions
  const goToPage = useCallback((page) => {
    setCurrentPage(page);
    
    setTimeout(() => {
      const gridTop = document.getElementById('asset-grid-top');
      if (gridTop) {
        gridTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 10);
  }, []);
  
  // Grid layout classes
  const gridClasses = useMemo(() => {
    if (layout === "grid") {
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6";
    }
    if (layout === "masonry") {
      return "columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-6 space-y-6";
    }
    return "grid grid-cols-1 gap-6";
  }, [layout]);
  
  // Function to observe an element
  const observeElement = useCallback((element) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div id="asset-grid-top"></div>
      
      {isLoading ? (
        // Loading state
        <div className={gridClasses}>
          {Array.from({ length: Math.min(12, itemsPerPage) }).map((_, index) => (
            <div key={`skeleton-${index}`} className="space-y-2">
              <Skeleton className={`w-full ${layout === "grid" ? "aspect-[9/16]" : "h-64"}`} />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Grid of assets
        <div className={cn(gridClasses, "px-2")}>
          {paginatedAssets.map((asset) => {
            const previewPath = getPreviewPath(asset);
            const fullPath = previewPath ? `http://localhost:8000${previewPath}` : null;
            const isHovered = hoveredId === asset.id;
            const isVisible = visibleAssets[asset.id];
            
            return (
              <div
                key={asset.id}
                data-asset-id={asset.id}
                ref={observeElement}
                className={cn(
                  "relative group cursor-pointer fade-in duration-300",
                  layout === "masonry" && "break-inside-avoid"
                )}
                onClick={() => onSelect(asset)}
              >
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                  <div className="relative">
                    {/* Favorite Button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={(e) => toggleFavorite(asset.id, e)}
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
                    <div 
                      className="relative overflow-hidden"
                      onMouseEnter={() => setHoveredId(asset.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {isVideo(previewPath) ? (
                        <>
                          {/* Only render video when it becomes visible */}
                          {isVisible ? (
                            <VideoHoverPreview
                              src={fullPath}
                              isHovered={isHovered}
                            />
                          ) : (
                            <div className={cn(
                              "w-full bg-zinc-800/80 flex items-center justify-center",
                              layout === "grid" ? "aspect-[9/16]" : "h-64"
                            )}>
                              <Play className="w-10 h-10 text-zinc-600" />
                            </div>
                          )}
                          
                          {/* Play icon */}
                          {!isHovered && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                              <Play className="w-12 h-12 text-white/80 drop-shadow-2xl" />
                            </div>
                          )}
                        </>
                      ) : (
                        <img
                          src={fullPath || "/fallback.jpg"}
                          alt={asset.name}
                          className={cn(
                            "w-full object-cover bg-accent/10 transition-transform hover:scale-105 duration-300",
                            layout === "grid" ? "aspect-[9/16]" : "max-h-[500px]"
                          )}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      
                      {/* Hover overlay */}
                      <div 
                        className={cn(
                          "absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-200",
                          isHovered ? "opacity-100" : "opacity-0"
                        )}
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
              </div>
            );
          })}
        </div>
      )}
      
      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              
              // Only render first, last, current and adjacent pages
              const isFirstPage = pageNum === 1;
              const isLastPage = pageNum === totalPages;
              const isCurrentPage = pageNum === currentPage;
              const isAdjacentPage = Math.abs(pageNum - currentPage) === 1;
              const shouldRender = isFirstPage || isLastPage || isCurrentPage || isAdjacentPage;
              
              if (!shouldRender) {
                // Show ellipsis only once between ranges
                if (
                  (pageNum === 2 && currentPage > 3) || 
                  (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <span key={`ellipsis-${pageNum}`} className="px-1 text-sm opacity-60">...</span>;
                }
                return null;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className={cn(
                    "h-9 w-9 font-medium",
                    currentPage === pageNum && "bg-primary text-primary-foreground pointer-events-none"
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Results count */}
      {!isLoading && totalCount > itemsPerPage && (
        <div className="text-center text-sm text-muted-foreground pb-2">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount} assets
        </div>
      )}
    </div>
  );
}

// Simple video component
const VideoHoverPreview = React.memo(function VideoHoverPreview({ src, isHovered }) {
  const videoRef = useRef(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isHovered) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Ignore errors - often due to autoplay restrictions
        });
      }
    } else {
      video.pause();
    }
    
    return () => {
      video.pause();
    };
  }, [isHovered]);
  
  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        preload="metadata"
        playsInline
        className={cn(
          "w-full aspect-[9/16] object-cover bg-accent/10 transition-transform duration-300",
          isHovered && "scale-105"
        )}
      />
    </div>
  );
});