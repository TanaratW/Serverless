export interface Tag {
  id: number;
  name: string;
  color: string;
}

export type TodoTag = {
  id: string;
  todo_id: string;
  tag_id: string;
};
