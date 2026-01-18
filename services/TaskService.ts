import { ITaskRepository } from "../repository/interface/ITaskRepository";

export class TaskService{
    constructor(
        private taskRepository: ITaskRepository) { }

        async completeTask(taskId: string){

            await this.taskRepository.updateStatus(taskId, "done");

    }

    async deleteTask(taskId: string){

        await this.taskRepository.delete(taskId);
    
    }

}