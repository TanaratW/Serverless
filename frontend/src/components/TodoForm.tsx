import React, { useState } from "react";
import type { Tag } from "../types/Priority";

interface TodoFormProps {
  onAddTodo: (
    title: string,
    description: string,
    due_date: string | null
  ) => void,
    tags: Tag[];
}

const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTodo(title.trim(), description.trim(), dueDate ? dueDate : null);
      setTitle("");
      setDescription("");
      setDueDate("");
      setShowForm(false);
    }
  };

  return (
    <div className="todo-form-container">
      {!showForm ? (
        <div className="center-container">
        <button className="add-task-btn" onClick={() => setShowForm(true)}>
            + Add New Task
         </button>
        </div>

      ) : (
        <form onSubmit={handleSubmit} className="todo-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="due-date">Due Date (Optional)</label>
            <input
              type="date"
              id="due-date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-buttons">
            <button type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit">Add Task</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TodoForm;
