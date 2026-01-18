import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "../src/firebase/firebase";
import { ITaskRepository } from "./interface/ITaskRepository";
import { Task, TaskStatus } from "../model/Task";

export class TaskRepository implements ITaskRepository {
  private ref = collection(db, "tasks");

  async getAll(): Promise<Task[]> {
    const snap = await getDocs(this.ref);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Task[];
  }

  async getAllTasks(): Promise<Task[]> {
    return this.getAll();
  }

  async getById(id: string): Promise<Task | null> {
    const taskDocRef = doc(db, "tasks", id);
    const snap = await getDoc(taskDocRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Task;
  }

  // Interface-compatible wrapper
  async getTaskById(id: string): Promise<Task | null> {
    return this.getById(id);
  }

  async create(task: Task): Promise<void> {
    // Validation: priority 1–4
    if (task.priority < 1 || task.priority > 4) {
      throw new Error("Priority must be between 1 and 4");
    }

    const now = Timestamp.now();

    await addDoc(this.ref, {
      ...task,
      status: task.status || "todo",
      created_at: now,
      updated_at: now,
      completed_at: task.status === "done" ? now : null
    });
  }

  // Interface-compatible wrapper
  async createTask(task: Task): Promise<void> {
    return this.create(task);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    const now = Timestamp.now();

    if (!["todo", "in_progress", "blocked", "done"].includes(status)) {
      throw new Error("Invalid status value");
    }

    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, {
      status,
      updated_at: now,
      completed_at: status === "done" ? now : null
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "tasks", id));
  }

  async deteleTask(id: string): Promise<void> {
    return this.delete(id);
  }
}
