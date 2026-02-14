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

import { db, auth } from "../src/firebase/firebase";
import { ITaskRepository } from "./interface/ITaskRepository";
import { Task, TaskStatus } from "../model/Task";

export class TaskRepository implements ITaskRepository {
  private ref = collection(db, "tasks");

  private getCurrentUid(): string | null {
    return auth.currentUser ? auth.currentUser.uid : null;
  }

  // 🔹 Get all tasks (debug / admin use)
  async getAllTasks(): Promise<Task[]> {
    const uid = this.getCurrentUid();
    if (!uid) return [];

    const q = query(this.ref, where('owner_uid', '==', uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Task[];
  }

  // 🔹 Main tasks only (parent_id === null)
  async getMainTasks(): Promise<Task[]> {
    const uid = this.getCurrentUid();
    if (!uid) return [];

    const q = query(this.ref, where('owner_uid', '==', uid), where('parent_id', '==', null));
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return results as Task[];
  }

  // 🔹 Subtasks of a task
  async getSubTasks(parentId: string): Promise<Task[]> {
    const uid = this.getCurrentUid();
    if (!uid) return [];

    const q = query(this.ref, where('owner_uid', '==', uid), where("parent_id", "==", parentId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Task[];
  }

  // 🔹 Single task
  async getTaskById(id: string): Promise<Task | null> {
    const ref = doc(db, "tasks", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const data = snap.data() as any;
    const uid = this.getCurrentUid();
    if (!uid) return null;

    if (data.owner_uid && data.owner_uid !== uid) return null;

    return { id: snap.id, ...data } as Task;
  }

  // 🔹 Create task or subtask
  async createTask(task: Task): Promise<void> {
    if (task.priority < 1 || task.priority > 4) {
      throw new Error("Priority must be between 1 and 4");
    }

    if (!task.task_name || task.task_name.trim() === '') {
      throw new Error("Task name is required");
    }

    const now = Timestamp.now();
    const uid = this.getCurrentUid();
    if (!uid) throw new Error('Not authenticated');

    await addDoc(this.ref, {
      task_name: task.task_name,
      description: task.description ?? null,
      parent_id: task.parent_id ?? null,
      status: task.status ?? "todo",
      priority: task.priority,
      due_date: task.due_date ? Timestamp.fromDate(task.due_date) : null,
      attachments: task.attachments ?? null,

      // ✅ NEW: Emoji fields
      difficulty_emoji: task.difficulty_emoji ?? null,
      completion_mood: task.completion_mood ?? null,

      created_at: now,
      updated_at: now,
      completed_at: task.status === "done" ? now : null,
      owner_uid: uid
    });
  }

  // 🔹 Update status
  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    if (!["todo", "in_progress", "blocked", "done"].includes(status)) {
      throw new Error("Invalid status value");
    }

    const now = Timestamp.now();
    const ref = doc(db, "tasks", id);

    const snap = await getDoc(ref);
    const uid = this.getCurrentUid();
    if (!uid) throw new Error('Not authenticated');
    const data = snap.exists() ? (snap.data() as any) : null;
    if (!data || (data.owner_uid && data.owner_uid !== uid)) {
      throw new Error('Unauthorized');
    }

    await updateDoc(ref, {
      status,
      updated_at: now,
      completed_at: status === "done" ? now : null
    });
  }

  // 🔹 Update task fields (partial) — supports emoji fields
  async updateTask(id: string, data: Partial<Task>): Promise<void> {
    const now = Timestamp.now();
    const refDoc = doc(db, "tasks", id);

    const payload: any = { ...data, updated_at: now };

    // Convert due_date to Firestore Timestamp if provided
    if (data.due_date) {
      payload.due_date = Timestamp.fromDate(data.due_date as Date);
    }

    // ✅ Explicitly allow null for emoji fields (clearing them)
    // Don't delete keys that are intentionally null
    const nullableFields = ['difficulty_emoji', 'completion_mood'];

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined && !nullableFields.includes(k)) {
        delete payload[k];
      }
    });

    const snap = await getDoc(refDoc);
    const uid = this.getCurrentUid();
    if (!uid) throw new Error('Not authenticated');
    const existing = snap.exists() ? (snap.data() as any) : null;
    if (!existing || (existing.owner_uid && existing.owner_uid !== uid)) {
      throw new Error('Unauthorized');
    }

    await updateDoc(refDoc, payload);
  }

  // 🔹 Delete task
  async deleteTask(id: string): Promise<void> {
    const refDoc = doc(db, "tasks", id);
    const snap = await getDoc(refDoc);
    const uid = this.getCurrentUid();
    if (!uid) throw new Error('Not authenticated');
    const data = snap.exists() ? (snap.data() as any) : null;
    if (!data || (data.owner_uid && data.owner_uid !== uid)) {
      throw new Error('Unauthorized');
    }

    await deleteDoc(refDoc);
  }
}