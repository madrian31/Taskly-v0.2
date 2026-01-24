import { ITaskRepository } from "../repository/interface/ITaskRepository";
import { TaskStatus } from "../model/Task";

export class TaskService {
    constructor(private taskRepository: ITaskRepository) {}

    // Mark a task as complete
    async completeTask(taskId: string): Promise<void> {
        // use repository's updateStatus to set status to 'done'
        await this.taskRepository.updateStatus(taskId, 'done');
    }

    // Reopen a task (mark as todo)
    async reopenTask(taskId: string): Promise<void> {
        // reopen by setting status to 'todo'
        await this.taskRepository.updateStatus(taskId, 'todo');
    }

    // Update status (generic)
    async updateStatus(taskId: string, status: TaskStatus): Promise<void> {
        // delegate to repository updateStatus
        await this.taskRepository.updateStatus(taskId, status);
    }

    // Delete a task (can extend to delete subtasks too)
    async deleteTask(taskId: string): Promise<void> {
        await this.taskRepository.deleteTask(taskId);
    }
}