export interface User {
  id: string;
  uid?: string; // firebase auth uid (if separate)
  displayName?: string;
  email?: string;
  photoURL?: string;
  role?: 'user' |'member' |'admin';
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
    createdAt: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : data.createdAt ?? Date.now(),
  };
}