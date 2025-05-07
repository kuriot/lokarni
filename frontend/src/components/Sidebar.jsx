import { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { Github, Coffee, MessageCircle } from "lucide-react";
import axios from "axios";
import { ReactComponent as Logo } from "../assets/logo.svg";

export default function Sidebar({ onSelectCategory }) {
  const [active, setActive] = useState("All Assets");
  const [groups, setGroups] = useState([]);

  const specialViews = {
    Add: LucideIcons.Plus,
    Manage: LucideIcons.FolderCog,
    Settings: LucideIcons.Settings,
    Search: LucideIcons.Search,
  };

  const loadCategories = () => {
    axios.get("/api/categories").then((res) => {
      const fetched = res.data.map((cat) => ({
        title: cat.title,
        items: cat.subcategories.map((s) => ({
          name: s.name,
          icon: s.icon,
        })),
      }));

      const staticGroup = {
        title: "General",
        items: [
          { name: "All Assets", icon: "Grid" },
          { name: "Favorites", icon: "Star" },
        ],
      };

      const filtered = fetched.filter((g) => g.title !== "General");
      setGroups([staticGroup, ...filtered]);
    });
  };

  useEffect(() => {
    loadCategories();
    const handleUpdate = () => loadCategories();
    window.addEventListener("categories-updated", handleUpdate);
    return () => {
      window.removeEventListener("categories-updated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (!["Add", "Manage", "Settings"].includes(active)) return;
    loadCategories();
  }, [active]);

  const openGroup = groups.find((group) =>
    group.items.some((item) => item.name === active)
  )?.title;

  return (
    <aside className="w-64 bg-background text-text p-4 overflow-y-auto shadow-lg flex flex-col justify-between h-full">
      <div>
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6 group">
          <Logo className="w-12 h-12 text-primary drop-shadow-glow transition-transform group-hover:scale-110" />
          <h2 className="text-3xl font-bold text-primary drop-shadow-glow text-center">Lokarni</h2>
        </div>

        {/* Actions */}
        <div className="bg-background border border-box text-primary rounded-md p-3 mb-8 flex justify-between items-center text-xs">
          {Object.entries(specialViews).map(([key, Icon]) => (
            <div
              key={key}
              onClick={() => {
                setActive(key);
                onSelectCategory(key);
              }}
              className={`relative group cursor-pointer transition ${
                active === key ? "text-background" : "text-primary"
              }`}
            >
              <div
                className={`p-2 rounded-full transition ${
                  active === key
                    ? "bg-primary"
                    : "hover:bg-primary hover:text-background"
                }`}
              >
                <Icon size={18} />
              </div>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-box text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
                {key === "Add"
                  ? "Add new"
                  : key === "Manage"
                  ? "Verwalten"
                  : key === "Settings"
                  ? "Einstellungen"
                  : "Suchen"}
              </span>
            </div>
          ))}
        </div>

        {/* Kategorien */}
        <div className="mb-8">
          {groups.map((group, index) => {
            const isOpen = group.title === openGroup;
            return (
              <div key={`group-${index}-${group.title}`} className="mb-2">
                <button
                  onClick={() => {
                    const newActive = group.items[0].name;
                    setActive(newActive);
                    onSelectCategory(newActive);
                  }}
                  className="w-full flex justify-between items-center text-sm text-gray-400 uppercase font-semibold mb-2 hover:text-primary transition"
                >
                  {group.title}
                  {isOpen ? <LucideIcons.ChevronUp size={16} /> : <LucideIcons.ChevronDown size={16} />}
                </button>

                {isOpen && (
                  <div className="space-y-1">
                    {group.items.map((item, i) => {
                      const Icon = LucideIcons[item.icon] || LucideIcons.Circle;
                      return (
                        <button
                          key={`${group.title}-${i}-${item.name}`}
                          onClick={() => {
                            setActive(item.name);
                            onSelectCategory(item.name);
                          }}
                          className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-md font-medium transition text-sm ${
                            active === item.name
                              ? "bg-box text-primary"
                              : "hover:bg-box text-text hover:text-primary"
                          }`}
                        >
                          <Icon size={16} />
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-box">
        <div className="bg-box p-4 rounded-md text-sm font-medium text-primary space-y-2">
          <a href="https://github.com/Pixel-Arni" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-text transition">
            <Github size={16} /> Git
          </a>
          <a href="https://ko-fi.com/cranic" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition">
            <Coffee size={16} /> Support me
          </a>
          <a href="https://discord.gg/Y42PRC3ffp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition">
            <MessageCircle size={16} /> Discord
          </a>
          <hr className="border-t border-gray-700 my-2" />
          <p className="text-xs text-gray-400 text-center">
            Special thanks to{" "}
            <a href="https://civitai.com/user/Astroburner" target="_blank" rel="noopener noreferrer" className="hover:text-primary underline transition">
              Astroburner
            </a>
          </p>
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">
          Built by Arni aka. Cranic
        </p>
      </div>
    </aside>
  );
}
