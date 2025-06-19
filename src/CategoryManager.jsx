import React, { useState, useEffect } from "react";

function CategoryManager({ onClose, onCategoriesChanged }) {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    fetch("http://localhost:8080/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    })
      .then((res) => res.json())
      .then((cat) => {
        setCategories([...categories, cat]);
        setNewCategoryName("");
        if (onCategoriesChanged) onCategoriesChanged();
      });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category? IT WILL DELETE ALL NOTES WITH THIS CATEGORY!"
    );
    if (!confirmDelete) return;
    fetch(`http://localhost:8080/api/categories/${id}`, { method: "DELETE" })
      .then(() => {
        setCategories(categories.filter((c) => c.id !== id));
        if (onCategoriesChanged) onCategoriesChanged();
      });
  };

  return (
    <div style={{ padding: "1em", maxWidth: "400px", margin: "auto" }}>
      <h2>Categories handler</h2>
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
        {categories.map((cat) => (
          <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
            {cat.name}
            <button onClick={() => handleDelete(cat.id)}>delete</button>
          </div>
        ))}
      </div>
      <button onClick={onClose}>Back</button>
    </div>
  );
}

export default CategoryManager;