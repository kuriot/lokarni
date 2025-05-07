import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import AssetGrid from "./components/AssetGrid";
import AssetModal from "./components/AssetModal";

import AddContent from "./content/AddContent";
import ManageContent from "./content/ManageContent";
import SettingsContent from "./content/SettingsContent";
import SearchContent from "./content/SearchContent";

export default function App() {
  const [category, setCategory] = useState("All");
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

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

  const handleUpdate = () => {
    fetchAssets();
    setSelectedAsset(null);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar onSelectCategory={setCategory} />
      <main className="flex-1 p-6 overflow-auto bg-background">
        <header className="mb-6">
          <h2
            className="font-semibold"
            style={{
              color: "rgb(226, 242, 99)",
              fontSize: "22px",
              lineHeight: "1.3",
            }}
          >
            {category}
          </h2>
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
