import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { FileText, Image, Link, Search } from "lucide-react";
import AddFromCivitai from "../components/AddFromCivitai";
import AddManualForm from "../components/AddManualForm";
import AddFromCivitaiSearch from "../components/AddFromCivitaiSearch";
import ImportImagePage from "../content/ImportImagePage";

export default function AddContent({ onImportSuccess }) {
  const [activeTab, setActiveTab] = useState("manual");

  const tabs = [
    { 
      key: "manual", 
      label: "Manual", 
      icon: LucideIcons.FileText, 
      color: "text-blue-500", 
      bgColor: "hover:bg-blue-500/10" 
    },
    { 
      key: "image", 
      label: "From Image", 
      icon: LucideIcons.Image, 
      color: "text-emerald-500", 
      bgColor: "hover:bg-emerald-500/10" 
    },
    { 
      key: "civitai", 
      label: "CivitAI Link", 
      icon: LucideIcons.Link, 
      color: "text-violet-500", 
      bgColor: "hover:bg-violet-500/10" 
    },
    { 
      key: "civitai-search", 
      label: "CivitAI Search", 
      icon: LucideIcons.Search, 
      color: "text-amber-500", 
      bgColor: "hover:bg-amber-500/10" 
    },
  ];

  return (
    <div className="bg-[#2a2b2e] p-6 rounded-lg shadow-md mb-6">
      {/* Tabs */}
      <div className="flex border-b border-box mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition rounded-t ${
                activeTab === tab.key
                  ? "bg-background text-primary border-t border-l border-r border-box"
                  : `text-gray-400 hover:text-white ${tab.bgColor}`
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === tab.key ? "text-primary" : tab.color}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === "manual" && <AddManualForm onSave={onImportSuccess} />}
        
        {activeTab === "civitai" && (
          <div className="space-y-4">

            <AddFromCivitai onImportSuccess={onImportSuccess} />
          </div>
        )}

        {activeTab === "civitai-search" && (
          <AddFromCivitaiSearch onImportSuccess={onImportSuccess} />
        )}

        {activeTab === "image" && (
          <ImportImagePage onImportSuccess={onImportSuccess} />
        )}
      </div>
    </div>
  );
}