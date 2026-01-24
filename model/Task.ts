export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

export interface Task {
  id?: string;
  parent_id?: string;
  task_name: string;
  description?: string;
  status: TaskStatus;
  priority: 1 | 2 | 3 | 4;
  due_date?: Date;
  created_at?: Date;
  updated_at?: Date;
  completed_at?: Date | null;
}