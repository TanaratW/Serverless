import axios from "axios";
import type { Tag, TodoTag } from "../../types/Priority";

const API_BASE = "http://localhost/priority-service";

export const getTags = async () => {
  return await axios.get<Tag[]>(`${API_BASE}/tags`);
};

export const createTag = async (tag: Omit<Tag, "id">) => {
  return await axios.post<Tag>(`${API_BASE}/tags`, tag);
};

// Assign a tag to a todo
export const assignTagToTodo = async (todoId: string, tagName: string) => {
  return axios.post(`${API_BASE}/todo-tags`, {
    todo_id: todoId,
    tag: tagName
  });
};

// Get all tags associated with a specific todo
export const getTagsForTodo = async (todoId: string) => {
  return axios.get(`${API_BASE}/todo-tags/${todoId}`);
};

