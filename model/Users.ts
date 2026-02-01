export interface User {
  id: string;
  uid?: string; 
  displayName?: string;
  email?: string;
  photoURL?: string;
  role?: 'user'|'admin'|'manager';
  department?: string;
  status?: 'active' | 'inactive' | 'pending';
  lastActive?: string;
  createdAt?: number; 
}

export function userFromFirebase(docId: string, data: any): User {
  return {
    id: docId,
    uid: data.uid ?? data.authUid ?? undefined,
    displayName: data.displayName ?? data.name,
    email: data.email,
    photoURL: data.photoURL,
    role: data.role ?? 'user',
    department: data.department,
    status: data.status,
    lastActive: data.lastActive,
    createdAt: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : data.createdAt ?? Date.now(),
  };
}