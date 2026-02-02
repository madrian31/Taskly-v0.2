import { Task, TaskStatus, Attachment } from "../../model/Task";

export interface ITaskService {
    completeTask(taskId: string): Promise<void>;
    reopenTask(taskId: string): Promise<void>;
    updateStatus(taskId: string, status: TaskStatus): Promise<void>;
    deleteTask(taskId: string): Promise<void>;

    // Upload multiple files and return Attachment metadata
    uploadTaskFiles(files: File[]): Promise<Attachment[]>;

    // Remove an attachment from a task
    removeTaskAttachment(taskId: string, attachmentId: string, attachment: Attachment): Promise<void>;

    // Utility: check if a File is an image
    isImageFile(file: File): boolean;
}