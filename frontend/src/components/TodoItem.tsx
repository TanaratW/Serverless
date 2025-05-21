import React, { useState } from "react";
import type { Todo } from "../types/Todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onViewTodo?: () => void; // ✅ เพิ่มฟังก์ชันนี้
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onViewTodo, // ✅ รับ props เข้ามา
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <div className="todo-header">
        <div className="todo-main">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={onToggle}
            className="todo-checkbox"
          />
          <span
            className="todo-title"
            onClick={() => setShowDetails(!showDetails)}
          >
            {todo.title}
          </span>
        </div>

        <div className="todo-actions">
          {todo.due_date && (
            <span className="due-date">Due: {formatDate(todo.due_date)}</span>
          )}
          <button onClick={onDelete} className="delete-button">
            ×
          </button>
          {onViewTodo && (
            <button onClick={onViewTodo} className="view-button">
              View
            </button>
          )}
        </div>
      </div>

      {showDetails && todo.description && (
        <div className="todo-details">
          <p>{todo.description}</p>
          <div className="todo-meta">
            <span>Created: {formatDate(todo.createdAt ?? null)}</span>
          </div>
        </div>
      )}
    </li>
  );
};

export default TodoItem;
