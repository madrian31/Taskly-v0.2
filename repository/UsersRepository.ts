import { db } from '../src/firebase/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, userFromFirebase } from '../model/users';
import { IUsersRepository } from './interface/IUsersRepository';

export class UsersRepository implements IUsersRepository {
	private col = collection(db, 'users');

	async getAll(): Promise<User[]> {
		const snap = await getDocs(this.col);
		return snap.docs.map(d => userFromFirebase(d.id, d.data()));
	}

	async getById(id: string): Promise<User | null> {
		const dref = doc(db, 'users', id);
		const snap = await getDoc(dref);
		if (!snap.exists()) return null;
		return userFromFirebase(snap.id, snap.data());
	}

	async create(user: Partial<User>): Promise<string> {
		const res = await addDoc(collection(db, 'users'), {
			...user,
			createdAt: user.createdAt ?? Date.now(),
		});
		return res.id;
	}

	/**
	 * Upsert a user document using the auth UID as the document id.
	 * This will create or update the document and set server timestamps.
	 * For existing users, only updates basic profile info (displayName, email, photoURL, lastActive)
	 * and preserves important fields like role, department, and status.
	 */
	async upsertByUid(uid: string, data: Partial<User>): Promise<void> {
		const ref = doc(db, 'users', uid);
		const snap = await getDoc(ref);
		
		if (snap.exists()) {
			// User exists - only update safe fields, preserve role/status/department
			const updateData: any = {
				updatedAt: serverTimestamp(),
			};
			
			// Only update basic profile fields from auth provider
			if (data.displayName !== undefined) updateData.displayName = data.displayName;
			if (data.email !== undefined) updateData.email = data.email;
			if (data.photoURL !== undefined) updateData.photoURL = data.photoURL;
			if (data.lastActive !== undefined) updateData.lastActive = data.lastActive;
			
			await updateDoc(ref, updateData);
		} else {
			// New user - create with default role: 'user' and status: 'active'
			// Users signing up with Google should be active by default.
			await setDoc(ref, {
				...data,
				uid,
				role: data.role ?? 'user', // Default role for new users
				status: data.status ?? 'active', // Default status: active for OAuth sign-ins
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});
		}
	}

	async update(id: string, data: Partial<User>): Promise<void> {
		await updateDoc(doc(db, 'users', id), data as any);
	}

	async delete(id: string): Promise<void> {
		await deleteDoc(doc(db, 'users', id));
	}
}

export default new UsersRepository();