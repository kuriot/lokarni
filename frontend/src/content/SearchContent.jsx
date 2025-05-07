import { useState, useEffect } from "react";
import AssetGrid from "../components/AssetGrid";
import AssetModal from "../components/AssetModal";

export default function SearchContent() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [keywords, setKeywords] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [categories, setCategories] = useState(["All"]);

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
      try {
        const res = await fetch(
          `http://localhost:8000/api/assets/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Fehler bei der Suche:", err);
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
    <div className="max-w-[1600px] mx-auto px-4">
      {/* Suchleiste mit Dropdown und Reset */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap items-center">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-white rounded px-3 py-2 text-sm pr-6"
          style={{ paddingRight: "2rem" }} // etwas mehr Platz für Pfeil
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suchbegriff eingeben..."
          className="w-full max-w-2xl p-3 rounded bg-zinc-900 text-white border border-zinc-700 shadow-sm text-center text-lg"
        />

        <button
          onClick={resetSearch}
          disabled={!query.trim()}
          className={`px-4 py-2 rounded text-sm transition ${
            query.trim()
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-zinc-800 text-gray-400 cursor-default"
          }`}
        >
          Zurücksetzen
        </button>
      </div>

      {/* Keyword-Wolke */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {keywords.map(({ word, count }) => (
          <button
            key={word}
            onClick={() => handleKeywordClick(word)}
            className="bg-box text-sm px-3 py-1 rounded-full text-primary border border-primary hover:bg-primary hover:text-background transition"
          >
            {word} <span className="text-gray-400 ml-1">({count})</span>
          </button>
        ))}
      </div>

      {/* Ergebnis-Grid */}
      <AssetGrid
        assets={results}
        setAssets={setResults}
        onSelect={setSelectedAsset}
      />

      {/* Modal */}
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
