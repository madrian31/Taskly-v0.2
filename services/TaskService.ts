import { ITaskRepository } from "../repository/interface/ITaskRepository";
import { IFileUploadService } from "./interfaces/IFileUploadService";
import { TaskStatus, Task, Attachment } from "../model/Task";

export class TaskService {
    constructor(
        private taskRepository: ITaskRepository,
        private fileUploadService?: IFileUploadService
    ) {}

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

    /**
     * Uploads files for a task (images go to images folder, others to files folder)
     */
    async uploadTaskFiles(files: File[]): Promise<Attachment[]> {
        if (!this.fileUploadService) {
            throw new Error('FileUploadService is not configured');
        }

        try {
            const uploadResults = await this.fileUploadService.uploadMultipleFiles(files);
            
            return uploadResults.map((result, index) => ({
                id: `attachment_${Date.now()}_${index}`,
                fileName: result.fileName,
                fileUrl: result.fileUrl,
                fileType: result.fileType,
                uploadedAt: result.uploadedAt,
            }));
        } catch (error) {
            console.error('Error uploading task files:', error);
            throw error;
        }
    }

    /**
     * Removes an attachment from a task
     */
    async removeTaskAttachment(taskId: string, attachmentId: string, attachment: Attachment): Promise<void> {
        try {
            // Delete from Firebase Storage
            if (this.fileUploadService) {
                await this.fileUploadService.deleteFile(attachment.fileUrl);
            }

            // Get the current task
            const task = await this.taskRepository.getTaskById(taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            // Remove attachment from the list
            const updatedAttachments = task.attachments?.filter(att => att.id !== attachmentId);
            
            // Update task with new attachments list
            await this.taskRepository.updateTask(taskId, {
                attachments: updatedAttachments
            });
        } catch (error) {
            console.error('Error removing task attachment:', error);
            throw error;
        }
    }

    /**
     * Checks if a file is an image
     */
    isImageFile(file: File): boolean {
        if (!this.fileUploadService) {
            // Fallback implementation
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
            return file.type.startsWith('image/') || imageExtensions.includes(fileExtension);
        }
        return this.fileUploadService.isImageFile(file);
    }
}