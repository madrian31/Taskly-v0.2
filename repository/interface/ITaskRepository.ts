import { Task, TaskStatus } from "../../model/Task";

export interface ITaskRepository {
    getAllTasks(): Promise<Task[]>;
    getTaskById(id: string): Promise<Task | null>;
    createTask(task: Task): Promise<void>;
    updateStatus(id: string, status: TaskStatus): Promise<void>;
    deteleTask(id: string): Promise<void>;
}