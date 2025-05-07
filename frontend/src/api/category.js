// frontend/src/api/category.js

const API_BASE = "http://localhost:8000/categories";

export async function fetchCategories() {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error("Fehler beim Laden der Kategorien");
  return await response.json();
}

export async function createCategory(category) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error("Fehler beim Erstellen der Kategorie");
  return await response.json();
}

export async function updateCategory(id, updated) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });
  if (!response.ok) throw new Error("Fehler beim Aktualisieren der Kategorie");
  return await response.json();
}

export async function deleteCategory(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE" });
  if (!response.ok) throw new Error("Fehler beim Löschen der Kategorie");
  return true;
}

export async function createSubCategory(categoryId, subcategory) {
  const response = await fetch(`${API_BASE}/${categoryId}/subcategories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subcategory),
  });
  if (!response.ok) throw new Error("Fehler beim Erstellen der Subkategorie");
  return await response.json();
}

export async function updateSubCategory(id, subcategory) {
  const response = await fetch(`${API_BASE}/subcategories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subcategory),
  });
  if (!response.ok) throw new Error("Fehler beim Aktualisieren der Subkategorie");
  return await response.json();
}

export async function deleteSubCategory(id) {
  const response = await fetch(`${API_BASE}/subcategories/${id}`, {
    method: "DELETE" });
  if (!response.ok) throw new Error("Fehler beim Löschen der Subkategorie");
  return true;
}
