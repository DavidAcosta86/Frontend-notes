import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function CategoryManager({ onClose, onCategoriesChanged }) {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching categories");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Categories is not an array");
        setCategories(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return; // No agregar vacío

    fetch(`${API_URL}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error adding category");
        return res.json();
      })
      .then((cat) => {
        setCategories((prev) => [...prev, cat]);
        setNewCategoryName("");
        if (onCategoriesChanged) onCategoriesChanged();
      })
      .catch((err) => alert(err.message));
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category? IT WILL DELETE ALL NOTES WITH THIS CATEGORY!"
    );
    if (!confirmDelete) return;

    fetch(`${API_URL}/api/categories/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Error deleting category");
        setCategories((prev) => prev.filter((c) => c.id !== id));
        if (onCategoriesChanged) onCategoriesChanged();
      })
      .catch((err) => alert(err.message));
  };

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "1em", maxWidth: "400px", margin: "auto" }}>
      <h2>Categories Manager</h2>
      <form onSubmit={handleAdd}>
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New Category Name"
          required
        />
        <button type="submit">Add</button>
      </form>
      <div>
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              style={{ display: "flex", alignItems: "center", gap: "0.5em" }}
            >
              <span>{cat.name}</span>
              <button onClick={() => handleDelete(cat.id)}>Delete</button>
            </div>
          ))
        ) : (
          <p>No categories found</p>
        )}
      </div>
      <button onClick={onClose} style={{ marginTop: "1em" }}>
        Back
      </button>
    </div>
  );
}

export default CategoryManager;
