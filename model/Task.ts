export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}

export interface Task {
  id?: string;
  parent_id?: string;
  task_name: string;
  description?: string;
  status: TaskStatus;
  priority: 1 | 2 | 3 | 4;
  due_date?: Date;
  attachments?: Attachment[];
  created_at?: Date;
  updated_at?: Date;
  completed_at?: Date | null;
}