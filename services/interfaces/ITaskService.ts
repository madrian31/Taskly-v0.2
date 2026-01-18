import { Task } from "../../model/Task";

export interface ITaskRepository {
    getAllTasks(): Promise<Task[]>;
    getTaskById(id: string): Promise<Task | null>;
    createTask(task: Task): Promise<void>;
    updateStatus(id: string, status: string): Promise<void>;
    deleteTask(id: string): Promise<void>;
}