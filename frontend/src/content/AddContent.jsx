import { useState } from "react";
import AddFromCivitai from "../components/AddFromCivitai";
import AddManualForm from "../components/AddManualForm";
import AddFromCivitaiSearch from "../components/AddFromCivitaiSearch";

export default function AddContent({ onImportSuccess }) {
  const [activeTab, setActiveTab] = useState("manual");

  const tabs = [
    { key: "manual", label: "📝 Manuell" },
    { key: "civitai", label: "🌐 CivitAI-Link" },
    { key: "civitai-search", label: "🔎 CivitAI-Search" },
  ];

  return (
    <div className="bg-[#2a2b2e] p-6 rounded-lg shadow-md mb-6">
      {/* Tabs */}
      <div className="flex border-b border-box mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-semibold transition rounded-t ${
              activeTab === tab.key
                ? "bg-background text-primary border-t border-l border-r border-box"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inhalt */}
      <div className="mt-4">
        {activeTab === "manual" && <AddManualForm onSave={onImportSuccess} />}
        {activeTab === "civitai" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Füge hier den Link zu einem Modell von{" "}
              <a
                href="https://civitai.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                civitai.com
              </a>{" "}
              ein und importiere es direkt in deine Sammlung.
            </p>
            <AddFromCivitai onImportSuccess={onImportSuccess} />
          </div>
        )}

        {activeTab === "civitai-search" && (
          <AddFromCivitaiSearch onImportSuccess={onImportSuccess} />
        )}
      </div>
    </div>
  );
}
