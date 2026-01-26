import { Task, TaskStatus } from "../../model/Task";

export interface ITaskRepository {
  getAllTasks(): Promise<Task[]>;

  getMainTasks(): Promise<Task[]>;
  getSubTasks(parentId: string): Promise<Task[]>;

  getTaskById(id: string): Promise<Task | null>;

  createTask(task: Task): Promise<void>;
  updateStatus(id: string, status: TaskStatus): Promise<void>;
  updateTask(id: string, data: Partial<Task>): Promise<void>;

  deleteTask(id: string): Promise<void>;
}
