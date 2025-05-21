// src/services/userService.ts

import axios from "axios";
import type { User, CreateUserPayload, LoginResponse } from "../../types/User";

// 💡 baseURL สำหรับ user service
const USER_SERVICE = "http://localhost/user-service";

// 🔐 สมัคร user ใหม่
export const registerUser = (user: CreateUserPayload) =>
  axios.post<User>(`${USER_SERVICE}/users`, user);

export const login = (username: string, password: string) =>
  axios.post<LoginResponse>(`${USER_SERVICE}/login`, { username, password });

// 📋 ดึง user ทั้งหมด
export const getAllUsers = () =>
  axios.get<User[]>(`${USER_SERVICE}/users`);

// 🔍 ดึง user รายคนตาม id
export const getUserById = (id: number) =>
  axios.get<User>(`${USER_SERVICE}/users/${id}`);
