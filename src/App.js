import React, { useState, useEffect } from "react";
import "./App.css";
import CategoryManager from "./CategoryManager";

function App() {
  const [filter, setFilter] = useState("active");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    let url = "http://localhost:8080/api/notes";
    if (filter === "archived") {
      url += "/archived";
    } else if (filter === "all") {
      url += "/all";
    }
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error fetching notes");
        }
        return response.json();
      })
      .then((data) => {
        setNotes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [filter]);

  const fetchCategories = () => {
    fetch("http://localhost:8080/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddNote = (e) => {
    e.preventDefault();

    const newNote = { title, content, categoryIds: selectedCategoryIds };

    if (editingNoteId !== null) {
      // we are editing an existing note
      fetch(`http://localhost:8080/api/notes/${editingNoteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Error updating note");
          return response.json();
        })
        .then((updatedNote) => {
          setNotes(
            notes.map((note) =>
              note.id === editingNoteId ? updatedNote : note
            )
          );
          setTitle("");
          setContent("");
          setEditingNoteId(null); // exit edit mode
        })
        .catch((err) => alert(err.message));
    } else {
      // Creatging a new note
      fetch("http://localhost:8080/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Error creating note");
          return response.json();
        })
        .then((createdNote) => {
          setNotes([...notes, createdNote]);
          setTitle("");
          setContent("");
          setSelectedCategoryIds([]);
        })
        .catch((err) => alert(err.message));
    }
  };

  const toggleArchive = (id) => {
    fetch(`http://localhost:8080/api/notes/${id}/archive`, {
      method: "PATCH",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error changing archive status");
        return res.json();
      })
      .then((updatedNote) => {
        // 🧠 Si la nota archivada ya no cumple con el filtro actual, la sacamos del array
        setNotes((prevNotes) => {
          if (
            (filter === "active" && updatedNote.archived) ||
            (filter === "archived" && !updatedNote.archived)
          ) {
            return prevNotes.filter((note) => note.id !== updatedNote.id);
          } else {
            return prevNotes.map((note) =>
              note.id === updatedNote.id ? updatedNote : note
            );
          }
        });
      })
      .catch((err) => alert(err.message));
  };

  function deleteNote(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );
    if (!confirmDelete) return;
    fetch(`http://localhost:8080/api/notes/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error when deleting note");
        }
        setNotes(notes.filter((note) => note.id !== id)); //actulize list of notes after deletion
      })
      .catch((error) => {
        alert(error.message);
      });
  }

  useEffect(() => {
    let url = "http://localhost:8080/api/notes";
    if (selectedCategory) {
      url = `http://localhost:8080/api/notes/by-category/${selectedCategory}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => setNotes(data));
  }, [selectedCategory]);

  if (loading) return <p>Loading notes...</p>;
  if (error) return <p>Error: {error}</p>;

  if (showCategories) {
    return (
      <CategoryManager
        onClose={() => {
          setShowCategories(false);
          fetchCategories();
          setLoading(true);
          setError(null);
          let url = "http://localhost:8080/api/notes";
          if (filter === "archived") {
            url += "/archived";
          } else if (filter === "all") {
            url += "/all";
          }
          fetch(url)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Error fetching notes");
              }
              return response.json();
            })
            .then((data) => {
              setNotes(data);
              setLoading(false);
            })
            .catch((err) => {
              setError(err.message);
              setLoading(false);
            });
        }}
      />
    );
  }

  return (
    <div>
      <h1 className="title">My notes</h1>
      <div className="filter-card">
        <button
          onClick={() => setFilter("active")}
          className={filter === "active" ? "selected" : ""}
        >
          Active notes
        </button>
        <button
          onClick={() => setFilter("archived")}
          className={filter === "archived" ? "selected" : ""}
        >
          Archived notes
        </button>
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? "selected" : ""}
        >
          All notes
        </button>
      </div>

      <div className="filter-card">
        <button onClick={() => setShowCategories(true)}>
          Category Manager
        </button>
        <div>
        <label>Filter by category: </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      </div>

      {notes.length === 0 ? (
        <p className="filter-card">No notes to show!!</p>
      ) : (
        <ul>
          {Array.isArray(notes) &&
            notes.map((note) => (
              <li key={note.id} className="note-item">
                <div className="note-content">
                  <strong>{note.title}</strong>
                  <p>{note.content}</p>
                  <div>
                    {note.categoryIds && note.categoryIds.length > 0 && (
                      <small>
                        Categories:{" "}
                        {note.categoryIds
                          .map(
                            (id) => categories.find((cat) => cat.id === id)?.name
                          )
                          .filter(Boolean)
                          .join(", ")}
                      </small>
                    )}
                  </div>
                </div>
                <div className="note-actions">
                  <button
                    onClick={() => {
                      setTitle(note.title);
                      setContent(note.content);
                      setEditingNoteId(note.id);
                      setSelectedCategoryIds(note.categoryIds || []);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => toggleArchive(note.id)}>
                    {note.archived ? "Unarchive" : "Archive"}
                  </button>
                  <button onClick={() => deleteNote(note.id)}>Delete</button>
                </div>
              </li>
            ))}
        </ul>
      )}
      <form onSubmit={handleAddNote}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <br />
        <div>
          <label>Categories:</label>
          <div style={{ display: "flex", gap: "1em", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <label key={cat.id} style={{ fontWeight: "normal" }}>
                <input
                  type="checkbox"
                  value={cat.id}
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                    } else {
                      setSelectedCategoryIds(
                        selectedCategoryIds.filter((id) => id !== cat.id)
                      );
                    }
                  }}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>
        <br />
        <div style={{ textAlign:"right"}}>
        <button  type="submit">
          {editingNoteId ? "Save Changes" : "Add new note"}
        </button>
        </div>
      </form>
      
    </div>
  );
}

export default App;
