export type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string | null;
  tagId?: string | null;  // เก็บ tag เดียว (ใช้สำหรับ UI ชั่วคราว)
  tags?: string[];       // เก็บหลาย tags (ใช้สำหรับ many-to-many)
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTodoPayload = {
  title: string;
  description: string;
  due_date: string | null;
  completed: boolean;
};

export type UpdateTodoPayload = {
  title: string;
  description: string;
  due_date: string | null;
  completed: boolean;
};
