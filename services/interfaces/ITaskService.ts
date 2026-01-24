import { Task, TaskStatus } from "../../model/Task";

export interface ITaskService {
    completeTask(taskId: string): Promise<void>;
    reopenTask(taskId: string): Promise<void>;
    updateStatus(taskId: string, status: TaskStatus): Promise<void>;
    deleteTask(taskId: string): Promise<void>;
}