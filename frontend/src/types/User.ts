export interface User {
  id: number;
  username: string;
  password: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
}

// 💡 เพิ่ม interface สำหรับ login response
export interface LoginResponse {
  token: string;
  user: User;
}
