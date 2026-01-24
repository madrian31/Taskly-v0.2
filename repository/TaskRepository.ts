import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  getDoc,
  query,
  where
} from "firebase/firestore";

import { db } from "../src/firebase/firebase";
import { ITaskRepository } from "./interface/ITaskRepository";
import { Task, TaskStatus } from "../model/Task";

export class TaskRepository implements ITaskRepository {
  private ref = collection(db, "tasks");

  // 🔹 Get all tasks (debug / admin use)
  async getAllTasks(): Promise<Task[]> {
    const snap = await getDocs(this.ref);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Task[];
  }

  // 🔹 Main tasks only (parent_id === null)
  async getMainTasks(): Promise<Task[]> {
    const q = query(this.ref, where("parent_id", "==", null));
    const snap = await getDocs(q);

    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Task[];
  }

  // 🔹 Subtasks of a task
  async getSubTasks(parentId: string): Promise<Task[]> {
    const q = query(this.ref, where("parent_id", "==", parentId));
    const snap = await getDocs(q);

    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Task[];
  }

  // 🔹 Single task
  async getTaskById(id: string): Promise<Task | null> {
    const ref = doc(db, "tasks", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...snap.data()
    } as Task;
  }

  // 🔹 Create task or subtask
  async createTask(task: Task): Promise<void> {
    if (task.priority < 1 || task.priority > 4) {
      throw new Error("Priority must be between 1 and 4");
    }

    const now = Timestamp.now();

    await addDoc(this.ref, {
      task_name: task.task_name,
      description: task.description ?? null,

      parent_id: task.parent_id ?? null, // ✅ SUBTASK SUPPORT

      status: task.status ?? "todo",
      priority: task.priority,

      due_date: task.due_date
        ? Timestamp.fromDate(task.due_date)
        : null,

      created_at: now,
      updated_at: now,
      completed_at: task.status === "done" ? now : null
    });
  }

  // 🔹 Update status
  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    if (!["todo", "in_progress", "blocked", "done"].includes(status)) {
      throw new Error("Invalid status value");
    }

    const now = Timestamp.now();
    const ref = doc(db, "tasks", id);

    await updateDoc(ref, {
      status,
      updated_at: now,
      completed_at: status === "done" ? now : null
    });
  }

  // 🔹 Delete task (and subtasks logically)
  async deleteTask(id: string): Promise<void> {
    await deleteDoc(doc(db, "tasks", id));
  }
}
