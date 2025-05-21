import React from "react";
import TodoItem from "./TodoItem";
import type { Todo } from "../types/Todo";

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;

}


const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleTodo,
  onDeleteTodo,

}) => {
  if (todos.length === 0) {
    return <div className="empty-list">No tasks found</div>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => onToggleTodo(todo.id)}
          onDelete={() => onDeleteTodo(todo.id)}
        
        />
      ))}
    </ul>
  );
};

export default TodoList;
