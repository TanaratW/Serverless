// src/services/todoService.ts

import axios from "axios";
import type { Todo, CreateTodoPayload } from "../../types/Todo";

// 💡 baseURL สำหรับ read todos
const TODO_READ_SERVICE = "http://localhost/lists-service";
// 💡 baseURL สำหรับ create/update/delete
const TODO_WRITE_SERVICE = "http://localhost/api";

export const getTodos = () =>
  axios.get<Todo[]>(`${TODO_READ_SERVICE}/todos-get`);

export const getTodoById = (id: string) =>
  axios.get<Todo>(`${TODO_READ_SERVICE}/todos/${id}`);

// ✅ POST ไปยัง microservice ที่รับผิดชอบ create
export const createTodo = (todo: CreateTodoPayload) =>
  axios.post<Todo>(`${TODO_WRITE_SERVICE}/todos`, todo);

// ✅ PUT/DELETE ไปยัง microservice ที่รับผิดชอบ update/delete
export const updateTodo = (id: string, todo: Todo) =>
  axios.put<Todo>(`${TODO_WRITE_SERVICE}/todos/${id}`, todo);

export const deleteTodo = (id: string) =>
  axios.delete<Todo>(`${TODO_WRITE_SERVICE}/todos/${id}`);

export const getCompletedTodos = () =>
  axios.get<Todo[]>(`${TODO_WRITE_SERVICE}/todos/completed`);

export const getIncompleteTodos = () =>
  axios.get<Todo[]>(`${TODO_WRITE_SERVICE}/todos/incomplete`);
