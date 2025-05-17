import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import {
  GripVertical, Trash2, Plus, Lock, Save, AlertCircle, ChevronDown
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";
import AssetTable from "./AssetTable"; 

const PROTECTED_CATEGORY_TITLE = "General";
const PROTECTED_SUBCATEGORIES = ["All Assets", "Favorites"];

// Liste der häufig verwendeten Lucide-Icons
const ICON_OPTIONS = [
  "Grid", "Database", "FolderTree", "Image", "FileImage", "Star", "Circle",
  "Settings", "Search", "Folder", "File", "Package", "Box", "Boxes",
  "Layers", "LayoutGrid", "LayoutList", "List", "ListChecks", "CheckSquare",
  "Camera", "Video", "Film", "Play", "Music", "Workflow", "Wand2",
  "Sparkles", "Palette", "Brush", "Paintbrush", "Eraser", "PenTool",
  "Link", "Chain", "Server", "Cloud", "Download", "Upload", "Monitor",
  "Smartphone", "Tablet", "User", "Users", "Brain", "Bot", "MessageCircle",
  "Quote", "FileText", "Book", "BookOpen", "Library", "Tag", "Tags",
  "Heart", "Clock", "Calendar", "Slash", "SquareDashedBottom", "Kanban"
];

export default function ManageContent() {
  const [activeTab, setActiveTab] = useState("assets");
  const [categories, setCategories] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);
  const [openIconDropdown, setOpenIconDropdown] = useState(null);

  useEffect(() => {
    loadCategories();
    
    // Close dropdown when clicking outside
    const handleClickOutside = () => setOpenIconDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadCategories = async () => {
    const res = await axios.get("/api/categories/");
    const data = res.data.map((cat) => ({
      title: cat.title,
      items: cat.subcategories.map((s) => ({ name: s.name, icon: s.icon })),
    }));
    setCategories(data);
  };

  const isProtectedGroup = (group) =>
    group.title.toLowerCase() === PROTECTED_CATEGORY_TITLE.toLowerCase();

  const isProtectedItem = (group, item) =>
    isProtectedGroup(group) &&
    PROTECTED_SUBCATEGORIES.some((name) => name.toLowerCase() === item.name.toLowerCase());

  const handleSave = async () => {
    setSaveStatus("saving");
    const payload = categories.map((cat, index) => ({
      title: cat.title,
      order: index,
      subcategories: cat.items.map((sub, i) => ({
        name: sub.name,
        icon: sub.icon,
        order: i,
      })),
    }));

    try {
      await axios.post("/api/categories/bulk", payload);
      window.dispatchEvent(new Event("categories-updated"));
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    const sourceGroup = categories[source.index];
    const sourceItem = categories[source.source?.droppableId]?.items[source.index];

    if (type === "group" && isProtectedGroup(sourceGroup)) return;
    if (type === "item" && isProtectedItem(sourceGroup, sourceItem)) return;

    if (type === "group") {
      const reordered = [...categories];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setCategories(reordered);
    } else {
      const group = categories[parseInt(source.droppableId)];
      const newItems = [...group.items];
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);
      setCategories(prev =>
        prev.map((g, i) => i === parseInt(source.droppableId) ? { ...g, items: newItems } : g)
      );
    }
  };

  const addNewCategory = () => {
    setCategories(prev => [
      ...prev,
      { title: "New Category", items: [{ name: "New Subcategory", icon: "Grid" }] }
    ]);
  };

  const addNewItem = (groupIndex) => {
    setCategories(prev =>
      prev.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              items: [...group.items, { name: "New Subcategory", icon: "Grid" }]
            }
          : group
      )
    );
  };

  const deleteCategory = (groupIndex) => {
    setCategories(prev => prev.filter((_, i) => i !== groupIndex));
  };

  const deleteItem = (groupIndex, itemIndex) => {
    setCategories(prev =>
      prev.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              items: group.items.filter((_, j) => j !== itemIndex)
            }
          : group
      )
    );
  };
  
  const handleIconSelect = (groupIndex, itemIndex, iconName) => {
    setCategories(prev => {
      const updated = [...prev];
      updated[groupIndex].items[itemIndex].icon = iconName;
      return updated;
    });
    setOpenIconDropdown(null);
  };

  const toggleIconDropdown = (e, groupIndex, itemIndex) => {
    e.stopPropagation(); // Prevent document click handler from closing it immediately
    setOpenIconDropdown(openIconDropdown === `${groupIndex}-${itemIndex}` ? null : `${groupIndex}-${itemIndex}`);
  };

  const tabs = [
    { 
      key: "assets", 
      label: "Assets", 
      icon: LucideIcons.Database, 
      color: "text-emerald-500", 
      bgColor: "hover:bg-emerald-500/10" 
    },
    { 
      key: "categories", 
      label: "Categories", 
      icon: LucideIcons.FolderTree, 
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
        {activeTab === "assets" && <AssetTable />}

        {activeTab === "categories" && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-background rounded hover:bg-primary/80 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              
              {saveStatus && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded ${
                  saveStatus === "saving" ? "bg-blue-900/30 text-blue-300" :
                  saveStatus === "success" ? "bg-green-900/30 text-green-300" :
                  "bg-red-900/30 text-red-300"
                }`}>
                  {saveStatus === "saving" && "Saving changes..."}
                  {saveStatus === "success" && "Changes saved ✓"}
                  {saveStatus === "error" && (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Error saving changes
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="groups" type="group">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {categories.map((group, groupIndex) => (
                        <Draggable
                          key={`${group.title}-${groupIndex}`}
                          draggableId={`${group.title}-${groupIndex}`}
                          index={groupIndex}
                          isDragDisabled={isProtectedGroup(group)}
                        >
                          {(provided) => (
                            <div 
                              ref={provided.innerRef} 
                              {...provided.draggableProps} 
                              className="bg-zinc-800/70 border border-zinc-700/50 rounded-lg p-4"
                            >
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-700">
                                <span 
                                  {...provided.dragHandleProps}
                                  className={`p-1 rounded cursor-grab ${isProtectedGroup(group) ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-700"}`}
                                >
                                  <GripVertical className="text-zinc-400" />
                                </span>
                                <input
                                  className="bg-zinc-900 text-white px-3 py-2 rounded border border-zinc-700 flex-1"
                                  defaultValue={group.title}
                                  onBlur={(e) =>
                                    setCategories(prev => {
                                      const updated = [...prev];
                                      updated[groupIndex].title = e.target.value;
                                      return updated;
                                    })
                                  }
                                  disabled={isProtectedGroup(group)}
                                  placeholder="Category Name"
                                />
                                {isProtectedGroup(group) && (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-900/30 text-yellow-300 text-xs">
                                    <Lock size={12} />
                                    Protected
                                  </div>
                                )}
                                {!isProtectedGroup(group) && (
                                  <button
                                    className="p-1 rounded hover:bg-red-900/50 transition-colors group"
                                    onClick={() => deleteCategory(groupIndex)}
                                    title="Delete Category"
                                  >
                                    <Trash2 size={18} className="text-red-400 group-hover:text-red-300" />
                                  </button>
                                )}
                              </div>

                              <Droppable droppableId={`${groupIndex}`} type="item">
                                {(dropProvided) => (
                                  <div 
                                    className="ml-4 space-y-2" 
                                    ref={dropProvided.innerRef} 
                                    {...dropProvided.droppableProps}
                                  >
                                    {group.items.map((item, itemIndex) => {
                                      const IconComponent = LucideIcons[item.icon] || LucideIcons.Circle;
                                      const dropdownId = `${groupIndex}-${itemIndex}`;
                                      const isDropdownOpen = openIconDropdown === dropdownId;

                                      return (
                                        <Draggable
                                          key={`${item.name}-${itemIndex}`}
                                          draggableId={`${group.title}-${item.name}-${itemIndex}`}
                                          index={itemIndex}
                                          isDragDisabled={isProtectedItem(group, item)}
                                        >
                                          {(dragProvided) => (
                                            <div
                                              ref={dragProvided.innerRef}
                                              {...dragProvided.draggableProps}
                                              className="flex items-center gap-2 p-2 bg-zinc-900/70 rounded border border-zinc-700/50"
                                            >
                                              <span 
                                                {...dragProvided.dragHandleProps}
                                                className={`p-1 rounded cursor-grab ${isProtectedItem(group, item) ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-700"}`}
                                              >
                                                <GripVertical className="text-zinc-400" size={14} />
                                              </span>
                                              
                                              {/* Icon Selection Button */}
                                              <div className="relative">
                                                <button
                                                  className={`
                                                    flex items-center justify-center w-10 h-9 border rounded transition-colors
                                                    ${isProtectedItem(group, item) ? 'bg-zinc-800 border-zinc-700 cursor-not-allowed' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'}
                                                  `}
                                                  onClick={(e) => !isProtectedItem(group, item) && toggleIconDropdown(e, groupIndex, itemIndex)}
                                                  disabled={isProtectedItem(group, item)}
                                                >
                                                  <IconComponent className="text-primary" size={18} />
                                                </button>
                                                
                                                {isDropdownOpen && !isProtectedItem(group, item) && (
                                                  <div 
                                                    className="absolute z-50 top-full left-0 mt-1 p-2 bg-zinc-800 border border-zinc-700 rounded w-[280px] shadow-lg"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto">
                                                      {ICON_OPTIONS.map((iconName) => {
                                                        const IconOpt = LucideIcons[iconName] || LucideIcons.Circle;
                                                        return (
                                                          <button
                                                            key={iconName}
                                                            className={`
                                                              flex items-center justify-center p-2 rounded transition-colors
                                                              ${item.icon === iconName ? 'bg-primary/20 text-primary' : 'hover:bg-zinc-700 text-zinc-300'}
                                                            `}
                                                            onClick={() => handleIconSelect(groupIndex, itemIndex, iconName)}
                                                            title={iconName}
                                                          >
                                                            <IconOpt size={16} />
                                                          </button>
                                                        );
                                                      })}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                              
                                              {/* Subcategory Name Input */}
                                              <input
                                                className="bg-zinc-900 text-white px-3 py-1 rounded border border-zinc-700 flex-1"
                                                defaultValue={item.name}
                                                onBlur={(e) =>
                                                  setCategories(prev => {
                                                    const updated = [...prev];
                                                    updated[groupIndex].items[itemIndex].name = e.target.value;
                                                    return updated;
                                                  })
                                                }
                                                disabled={isProtectedItem(group, item)}
                                                placeholder="Subcategory Name"
                                              />
                                              
                                              {isProtectedItem(group, item) && (
                                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-900/30 text-yellow-300 text-xs">
                                                  <Lock size={10} />
                                                  Protected
                                                </div>
                                              )}
                                              
                                              {!isProtectedItem(group, item) && (
                                                <button
                                                  className="p-1 rounded hover:bg-red-900/50 transition-colors group"
                                                  onClick={() => deleteItem(groupIndex, itemIndex)}
                                                  title="Delete Subcategory"
                                                >
                                                  <Trash2 size={14} className="text-red-400 group-hover:text-red-300" />
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                    {dropProvided.placeholder}
                                    {!isProtectedGroup(group) && (
                                      <div className="pt-2">
                                        <button
                                          onClick={() => addNewItem(groupIndex)}
                                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 px-3 py-1.5 border border-primary/20 rounded bg-primary/5 hover:bg-primary/10 transition-colors"
                                        >
                                          <Plus size={12} />
                                          Add Subcategory
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-zinc-700">
                <button
                  onClick={addNewCategory}
                  className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 px-4 py-2 border border-amber-500/20 rounded bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                >
                  <Plus size={16} className="text-amber-500" />
                  Add New Category
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}