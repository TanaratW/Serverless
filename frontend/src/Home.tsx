import React, { useState, useEffect } from "react";
//import TodoList from "./components/TodoList";
import TodoForm from "./components/TodoForm";
import type { Todo } from "./types/Todo";
import type { Tag, TodoTag } from "./types/Priority";
import { useNavigate } from "react-router-dom";
//import axios from "axios"; // เพิ่ม import axios
import "./App.css";
import "./index.css";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./service/http/todoService";
import { 
  getTags, 
  createTag, 
  assignTagToTodo, 
  getTagsForTodo 
} from "./service/http/priorityService";

const Home: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [todoTags, setTodoTags] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#000000");
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [expandedTodo, setExpandedTodo] = useState<string | null>(null);
  // เพิ่ม state สำหรับติดตามการทำงานของ API
  const [isUpdatingTag, setIsUpdatingTag] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername); 
    }

    fetchTodos();
    fetchTags();
  }, []);

  // แยกออกมาเป็น useEffect เฉพาะสำหรับการดึงข้อมูลแท็กเมื่อมีการเปลี่ยนแปลง todos
  useEffect(() => {
    if (todos.length > 0) {
      todos.forEach(todo => {
        fetchTodoTags(todo.id);
      });
    }
  }, [todos]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await getTodos();
      console.log("GET TODOS RESPONSE:", response.data);

      if (!Array.isArray(response.data)) {
        throw new Error("Todos response is not an array");
      }

      setTodos(response.data);
      setError(null);
    } catch (err) {
      setError("Error fetching todos. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await getTags();
      console.log("GET TAGS RESPONSE:", response.data);

      if (!Array.isArray(response.data)) {
        throw new Error("Tags response is not an array");
      }

      setTags(response.data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const fetchTodoTags = async (todoId: string) => {
    try {
      const response = await getTagsForTodo(todoId);
      console.log(`GET TAGS FOR TODO ${todoId}:`, response.data);
      
      if (!Array.isArray(response.data)) {
        throw new Error("Todo tags response is not an array");
      }
      
      // Store the tag IDs associated with this todo
      const tagIds = response.data.map((todoTag: TodoTag) => todoTag.tag_id);
      
      // อัพเดทสถานะ todoTags แบบ immutable
      setTodoTags(prev => ({
        ...prev,
        [todoId]: tagIds
      }));
    } catch (err) {
      console.error(`Error fetching tags for todo ${todoId}:`, err);
    }
  };

  const addTodo = async (
    title: string,
    description: string,
    due_date: string | null,
    tagId?: string
  ) => {
    try {
      // สร้าง todo ก่อน
      const newTodoPayload = { 
        title, 
        description, 
        due_date, 
        completed: false,
      };
      const response = await createTodo(newTodoPayload);
      const newTodo = response.data;
      
      // ถ้ามีการเลือกแท็ก ให้ผูกกับ todo ใหม่
      if (tagId) {
        const tag = tags.find(t => t.id === Number(tagId));
        if (tag) {
          console.log(`Assigning tag ${tag.name} to todo ${newTodo.id}`);
          try {
            await assignTagToTodo(newTodo.id, tag.name);
            console.log("Tag assigned successfully");
            
            // อัพเดทสถานะ todoTags
            setTodoTags(prev => ({
              ...prev,
              [newTodo.id]: [tagId]
            }));
          } catch (tagErr) {
            console.error("Error assigning tag:", tagErr);
          }
        }
      }

      setTodos(prevTodos => [...prevTodos, newTodo]);
      setError(null);
    } catch (err) {
      setError("Error adding todo. Please try again.");
      console.error(err);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await createTag({ name: newTagName, color: newTagColor });
      setTags(prevTags => [...prevTags, response.data]);
      setNewTagName("");
      setNewTagColor("#000000");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to add tag");
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todoToUpdate = todos.find((todo) => todo.id === id);
      if (!todoToUpdate) return;

      const updatedTodoPayload = {
        ...todoToUpdate,
        completed: !todoToUpdate.completed,
      };

      const response = await updateTodo(id, updatedTodoPayload);
      setTodos(prevTodos => prevTodos.map((todo) => (todo.id === id ? response.data : todo)));
      setError(null);
    } catch (err) {
      setError("Error updating todo. Please try again.");
      console.error(err);
    }
  };

  // แก้ไขฟังก์ชันนี้ให้ส่ง API request ทั้งเพิ่มและลบแท็ก
  const toggleTodoTag = async (todoId: string, tagId: string) => {
    try {
      setIsUpdatingTag(true);
      const tag = tags.find(t => t.id === Number(tagId));
      if (!tag) return;

      const currentTags = todoTags[todoId] || [];
      const isTagged = currentTags.includes(tagId);

      if (isTagged) {
        console.log(`Removing tag ${tag.name} from todo ${todoId}`);
        try {
          setTodoTags(prev => ({
            ...prev,
            [todoId]: currentTags.filter(id => id !== tagId)
          }));
        } catch (err) {
          console.error("Error removing tag:", err);
          throw err;
        }
      } else {
        
        console.log(`Assigning tag ${tag.name} to todo ${todoId}`);
        try {
         
          await assignTagToTodo(todoId, tag.name);
          console.log("Tag assigned successfully");
          
          setTodoTags(prev => ({
            ...prev,
            [todoId]: [...currentTags, tagId]
          }));
        } catch (err) {
          console.error("Error assigning tag:", err);
          throw err;
        }
      }
      
      setError(null);
    } catch (err) {
      setError("Error updating todo tag. Please try again.");
      console.error(err);
    } finally {
      setIsUpdatingTag(false);
    }
  };

  const deleteTodoById = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter((todo) => todo.id !== id));
      
      // Also remove this todo from the todoTags state
      setTodoTags(prev => {
        const newTodoTags = { ...prev };
        delete newTodoTags[id];
        return newTodoTags;
      });
      
      setError(null);
    } catch (err) {
      setError("Error deleting todo. Please try again.");
      console.error(err);
    }
  };

  // ฟังก์ชันเพื่อแสดง/ซ่อนแผงจัดการ tag
  const toggleExpand = (todoId: string) => {
    setExpandedTodo(expandedTodo === todoId ? null : todoId);
  };

  const filteredTodos = todos.filter((todo) => {
    // First apply completion filter
    const completionFilter = 
      filter === "active" ? !todo.completed : 
      filter === "completed" ? todo.completed : 
      true;
    
    // Then apply tag filter if one is selected
    let tagMatches = true;
      if (selectedTag) {
        const todoTagIds = (todoTags[todo.id] || []).map(Number); // แปลงทุกตัวเป็น number
        const selectedTagNumber = Number(selectedTag);
        tagMatches = todoTagIds.includes(selectedTagNumber);
    }

    
    return completionFilter && tagMatches;
  });

  // Utility function to determine text color based on background color
  const getContrastColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance - standard formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white based on luminance
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      <header className="app-header">
        <h1 className="main-title">TODO APP</h1>

        <div className="account-menu">
          <button className="auth-button login-button" onClick={() => navigate("/login")}>
            <span className="button-icon">👤</span> Login
          </button>
          <button className="auth-button register-button" onClick={() => navigate("/register")}>
            <span className="button-icon">📝</span> Register
          </button>
        </div>

        <div className="header-right">
          {username && (
            <div className="user-greeting">
              <span className="greeting-icon">👋</span> Hello, {username}
            </div>
          )}
          <div className="filter-buttons">
            <button
              className={`filter-button ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-button ${filter === "active" ? "active" : ""}`}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
            <button
              className={`filter-button ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="tags-filter">
          <h3 className="section-title">Filter by Tag</h3>
          <div className="tag-buttons">
            <button 
              className={`tag-filter-button ${selectedTag === null ? "active" : ""}`}
              onClick={() => setSelectedTag(null)}
            >
              All Tags
            </button>
            {tags.map(tag => (
              <button
                key={tag.id}
                className={`tag-filter-button ${selectedTag === tag.id ? "active" : ""}`}
                onClick={() => setSelectedTag(tag.id)}
                style={{ 
                  backgroundColor: tag.color, 
                  color: getContrastColor(tag.color),
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <TodoForm 
          onAddTodo={addTodo} 
          tags={tags}
        />
        
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : (
          <div className="todo-list">
            {filteredTodos.length === 0 ? (
              <div className="empty-state">No todos found</div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`todo-item ${todo.completed ? "completed" : ""}`}
                >
                  <div className="todo-main">
                    <div className="todo-checkbox">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                      />
                    </div>
                    <div className="todo-content">
                      <h3 className="todo-title">{todo.title}</h3>
                      <p className="todo-description">{todo.description}</p>
                      {todo.due_date && (
                        <p className="todo-due-date">
                          <span className="due-date-icon">📅</span> Due: {new Date(todo.due_date).toLocaleDateString()}
                        </p>
                      )}
                      
                      {/* Display tags associated with this todo */}
                      <div className="todo-tags">
                        {(todoTags[todo.id] || []).map(tagId => {
                          const tag = tags.find(t => t.id === Number(tagId));
                          if (!tag) return null;
                          return (
                            <span 
                              key={tag.id}
                              className="todo-tag-badge"
                              style={{
                                backgroundColor: tag.color,
                                color: getContrastColor(tag.color),
                              }}
                            >
                              {tag.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="todo-actions">
                      <button 
                        className="manage-tags-button"
                        onClick={() => toggleExpand(todo.id)}
                      >
                        {expandedTodo === todo.id ? "Hide Tags" : "Manage Tags"}
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => deleteTodoById(todo.id)}
                      >
                        <span className="delete-icon">🗑️</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Tag management panel - shown when a todo is expanded */}
                  {expandedTodo === todo.id && (
                    <div className="tag-management">
                      <h4 className="tag-management-title">Available Tags</h4>
                      <div className="available-tags">
                        {tags.map(tag => {
                          const isTagged = (todoTags[todo.id] || []).map(Number).includes(tag.id);
                          
                          return (
                            <button
                              key={tag.id}
                              className={`tag-toggle-button ${isTagged ? 'selected' : ''}`}
                              onClick={() => !isUpdatingTag && toggleTodoTag(todo.id, String(tag.id))}
                              disabled={isUpdatingTag}
                              style={{ 
                                backgroundColor: tag.color, 
                                color: getContrastColor(tag.color),
                              }}
                            >
                              <span className="tag-name">{tag.name}</span>
                              {isTagged && (
                                <span className="tag-selected-indicator">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
      
      <div className="add-tag-section">
        <h3 className="section-title">Add New Tag</h3>
        <div className="add-tag-form">
          <input
            type="text"
            className="tag-name-input"
            value={newTagName}
            placeholder="Tag name"
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <input
            type="color"
            className="tag-color-input"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
          />
          <button 
            className="add-tag-button"
            onClick={handleAddTag}
            disabled={!newTagName.trim()}
          >
            Add Tag
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;