import { useState, useEffect } from "react";
import { Search, X, Filter, Hash, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AssetGrid from "../components/AssetGrid";
import AssetModal from "../components/AssetModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SearchContent() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [keywords, setKeywords] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [categories, setCategories] = useState(["All"]);
  const [isLoading, setIsLoading] = useState(false);

  // Unterkategorien laden
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/categories");
        const data = await res.json();
        const subcats = data.flatMap(cat => cat.subcategories.map(sub => sub.name));
        setCategories(["All", ...subcats]);
      } catch (err) {
        console.error("Fehler beim Laden der Kategorien:", err);
      }
    };
    loadCategories();

    const listener = () => loadCategories();
    window.addEventListener("categories-updated", listener);
    return () => window.removeEventListener("categories-updated", listener);
  }, []);

  // Keywords laden
  useEffect(() => {
    const loadKeywords = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/assets/keywords?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
        );
        const data = await res.json();
        setKeywords(data);
      } catch (err) {
        console.error("Fehler beim Laden der Begriffe:", err);
      }
    };
    loadKeywords();
  }, [query, category]);

  // Assets laden
  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/api/assets/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Fehler bei der Suche:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadResults();
  }, [query, category]);

  const handleKeywordClick = (word) => {
    setQuery((prev) => {
      const terms = prev.split(" ").filter(Boolean);
      return [...new Set([...terms, word])].join(" ");
    });
  };

  const resetSearch = () => setQuery("");

  return (
    <div className="w-full px-4 space-y-6">
      {/* Suchkopf */}
      <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <Sparkles className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Asset Search</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-4">
            {/* Kategorie-Auswahl */}
            <div className="lg:col-span-2">
              <label className="text-xs text-zinc-500 mb-1.5 block">
                <Filter className="w-3.5 h-3.5 inline mr-1.5" />
                Category Filter
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-800/70 border-zinc-700 rounded-md h-12 px-3 text-sm text-white focus:ring-1 focus:ring-primary"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Suchfeld */}
            <div className="lg:col-span-6 relative">
              <label className="text-xs text-zinc-500 mb-1.5 block">
                <Search className="w-3.5 h-3.5 inline mr-1.5" />
                Search Query
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter keywords to search..."
                  className="w-full bg-zinc-800/70 border-zinc-700 focus-visible:ring-primary pl-10 pr-10 h-12 text-base"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                
                {query && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    onClick={resetSearch}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
          
          {/* Keyword-Wolke */}
          <AnimatePresence>
            {keywords.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 pt-4 border-t border-zinc-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium text-zinc-400">Popular Tags</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {keywords.map(({ word, count }, index) => (
                    <motion.div
                      key={word}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        transition: { delay: index * 0.02 }
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer bg-primary/5 hover:bg-primary/10 border-primary/30 transition-colors hover:text-white px-3 py-1"
                        onClick={() => handleKeywordClick(word)}
                      >
                        {word}
                        <span className="ml-1.5 text-xs text-zinc-500">({count})</span>
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      
      {/* Ergebnisbereich */}
      <div className="space-y-4">
        {/* Ergebnisüberschrift */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-medium text-zinc-300">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </span>
            ) : (
              <span>
                {results.length} results found
                {query && <span className="text-zinc-500 ml-2 text-sm">for "{query}"</span>}
                {category !== "All" && <span className="text-zinc-500 ml-2 text-sm">in {category}</span>}
              </span>
            )}
          </h2>
        </div>
        
        {/* Ergebnisse im Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <AssetGrid
            assets={results}
            setAssets={setResults}
            onSelect={setSelectedAsset}
            layout="grid" // Sicherstellen, dass wir das Grid-Layout verwenden
          />
        </motion.div>

        {/* Keine Ergebnisse */}
        {!isLoading && results.length === 0 && query && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12 text-center"
          >
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg py-8 px-6 max-w-md mx-auto">
              <Search className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <h3 className="text-lg font-medium text-zinc-300">No results found</h3>
              <p className="text-zinc-500 mt-2">
                Try adjusting your search terms or filter to find what you're looking for.
              </p>
              <Button 
                variant="outline" 
                className="mt-4 border-zinc-700 hover:bg-zinc-800"
                onClick={resetSearch}
              >
                Clear Search
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Asset Modal */}
      {selectedAsset && (
        <AssetModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onUpdate={() => {
            setSelectedAsset(null);
          }}
        />
      )}
    </div>
  );
}