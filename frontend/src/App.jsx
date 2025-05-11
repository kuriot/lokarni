// 📄 frontend/src/App.jsx

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import AssetGrid from "./components/AssetGrid";
import AssetModal from "./components/AssetModal";
import { LayoutGrid, LayoutPanelTop } from "lucide-react";

import AddContent from "./content/AddContent";
import ManageContent from "./content/ManageContent";
import SettingsContent from "./content/SettingsContent";
import SearchContent from "./content/SearchContent";

export default function App() {
  const [category, setCategory] = useState("All");
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [layout, setLayout] = useState(() => {
    return localStorage.getItem("lokarni-grid-layout") || "grid";
  });

  const fetchAssets = () => {
    let param = "";

    if (category === "Favoriten") {
      param = "?favorite=true";
    } else if (
      category === "All" ||
      ["Add", "Manage", "Settings", "Search"].includes(category)
    ) {
      param = "";
    } else {
      param = `?category=${encodeURIComponent(category)}`;
    }

    fetch(`http://localhost:8000/api/assets${param}`)
      .then((res) => {
        if (!res.ok) throw new Error("Serverantwort war nicht OK");
        return res.json();
      })
      .then((data) => setAssets(Array.isArray(data) ? data : []))
      .catch((err) =>
        console.error("Fehler beim Laden der Assets:", err.message)
      );
  };

  useEffect(() => {
    if (!["Add", "Manage", "Settings", "Search"].includes(category)) {
      fetchAssets();
    }
  }, [category]);

  useEffect(() => {
    localStorage.setItem("lokarni-grid-layout", layout);
  }, [layout]);

  const handleUpdate = () => {
    fetchAssets();
    setSelectedAsset(null);
  };

  const toggleLayout = () => {
    setLayout((prev) => (prev === "grid" ? "masonry" : "grid"));
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar onSelectCategory={setCategory} />
      <main className="flex-1 p-6 overflow-auto bg-background">
        <header className="mb-6 flex items-center justify-between">
          <h2
            className="font-normal"
            style={{
              color: "rgb(226, 242, 99)",
              fontSize: "22px",
              lineHeight: "1.3",
            }}
          >
            {category}
          </h2>
          <button
            onClick={toggleLayout}
            className="border border-[#e2f263] text-[#e2f263] rounded-lg p-2 hover:bg-[#e2f26320] transition"
            title="Change layout"
          >
            {layout === "grid" ? (
              <LayoutPanelTop className="w-5 h-5" />
            ) : (
              <LayoutGrid className="w-5 h-5" />
            )}
          </button>
        </header>

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
              onlyFavorites={category === "Favoriten"}
              category={category}
              layout={layout}
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
      </main>
    </div>
  );
}
