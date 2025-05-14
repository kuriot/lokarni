import { useEffect, useState } from "react";
import {
  GripVertical, Trash2, Plus, Lock
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";
import AssetTable from "./AssetTable"; 

const PROTECTED_CATEGORY_TITLE = "General";
const PROTECTED_SUBCATEGORIES = ["All Assets", "Favorites"];

const ICON_OPTIONS = [
  "🔹", "🖼️", "🎮", "🧠", "🎨", "👤", "🛠️",
  "🪄", "📆", "🪥", "🖌️", "📸", "🎭", "📁"
];

export default function ManageContent() {
  const [activeTab, setActiveTab] = useState("assets");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
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
      alert("Saved ✅");
    } catch {
      alert("Error saving ❌");
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
      { title: "New Category", items: [{ name: "New Subcategory", icon: "🔹" }] }
    ]);
  };

  const addNewItem = (groupIndex) => {
    setCategories(prev =>
      prev.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              items: [...group.items, { name: "New Subcategory", icon: "🔹" }]
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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Management</h2>

      <div className="flex gap-4 mb-4 border-b border-box pb-2">
        <button
          onClick={() => setActiveTab("assets")}
          className={`px-4 py-2 rounded-t font-semibold transition ${
            activeTab === "assets" ? "bg-box text-primary" : "text-text hover:text-primary"
          }`}
        >
          Manage Assets
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-t font-semibold transition ${
            activeTab === "categories" ? "bg-box text-primary" : "text-text hover:text-primary"
          }`}
        >
          Manage Categories
        </button>
      </div>

      {activeTab === "assets" && <AssetTable />}

      {activeTab === "categories" && (
        <>
          <div className="mb-6">
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-primary text-background rounded hover:bg-opacity-80"
            >
              Save Changes
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="groups" type="group">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {categories.map((group, groupIndex) => (
                    <Draggable
                      key={`${group.title}-${groupIndex}`}
                      draggableId={`${group.title}-${groupIndex}`}
                      index={groupIndex}
                      isDragDisabled={isProtectedGroup(group)}
                    >
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className="mb-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span {...provided.dragHandleProps}>
                              <GripVertical className="text-zinc-600" />
                            </span>
                            <input
                              className="bg-zinc-800 text-white px-2 py-1 rounded"
                              defaultValue={group.title}
                              onBlur={(e) =>
                                setCategories(prev => {
                                  const updated = [...prev];
                                  updated[groupIndex].title = e.target.value;
                                  return updated;
                                })
                              }
                              disabled={isProtectedGroup(group)}
                            />
                            {isProtectedGroup(group) && <Lock size={16} className="text-zinc-500" />}
                            {!isProtectedGroup(group) && (
                              <Trash2
                                size={16}
                                className="text-red-500 cursor-pointer"
                                onClick={() => deleteCategory(groupIndex)}
                              />
                            )}
                          </div>

                          <Droppable droppableId={`${groupIndex}`} type="item">
                            {(dropProvided) => (
                              <ul className="space-y-2 ml-4" ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
                                {group.items.map((item, itemIndex) => (
                                  <Draggable
                                    key={`${item.name}-${itemIndex}`}
                                    draggableId={`${group.title}-${item.name}-${itemIndex}`}
                                    index={itemIndex}
                                    isDragDisabled={isProtectedItem(group, item)}
                                  >
                                    {(dragProvided) => (
                                      <li
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        className="flex items-center gap-2"
                                      >
                                        <span {...dragProvided.dragHandleProps}>
                                          <GripVertical className="text-zinc-600" />
                                        </span>
                                        <select
                                          className="bg-zinc-800 text-white px-1 py-1 rounded text-sm"
                                          value={item.icon}
                                          disabled={isProtectedItem(group, item)}
                                          onChange={(e) =>
                                            setCategories(prev => {
                                              const updated = [...prev];
                                              updated[groupIndex].items[itemIndex].icon = e.target.value;
                                              return updated;
                                            })
                                          }
                                        >
                                          {ICON_OPTIONS.map((icon) => (
                                            <option key={icon} value={icon}>{icon}</option>
                                          ))}
                                        </select>
                                        <input
                                          className="bg-zinc-900 text-white px-2 py-1 rounded"
                                          defaultValue={item.name}
                                          onBlur={(e) =>
                                            setCategories(prev => {
                                              const updated = [...prev];
                                              updated[groupIndex].items[itemIndex].name = e.target.value;
                                              return updated;
                                            })
                                          }
                                          disabled={isProtectedItem(group, item)}
                                        />
                                        {isProtectedItem(group, item) && (
                                          <Lock size={16} className="text-zinc-500" />
                                        )}
                                        {!isProtectedItem(group, item) && (
                                          <Trash2
                                            size={16}
                                            className="text-red-500 cursor-pointer"
                                            onClick={() => deleteItem(groupIndex, itemIndex)}
                                          />
                                        )}
                                      </li>
                                    )}
                                  </Draggable>
                                ))}
                                {dropProvided.placeholder}
                                {!isProtectedGroup(group) && (
                                  <li>
                                    <button
                                      onClick={() => addNewItem(groupIndex)}
                                      className="text-xs text-primary hover:underline mt-2"
                                    >
                                      + Subcategory
                                    </button>
                                  </li>
                                )}
                              </ul>
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

          <div className="flex flex-col sm:flex-row items-center justify-between mt-12 pt-8 border-t border-zinc-700">
            <button
              onClick={addNewCategory}
              className="flex items-center gap-2 text-sm text-primary hover:text-white"
            >
              <Plus size={16} /> Add New Category
            </button>
          </div>
        </>
      )}
    </div>
  );
}