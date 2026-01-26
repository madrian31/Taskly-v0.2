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
	 */
	async upsertByUid(uid: string, data: Partial<User>): Promise<void> {
		const ref = doc(db, 'users', uid);
		await setDoc(ref, {
			...data,
			uid,
			updatedAt: serverTimestamp(),
			createdAt: serverTimestamp(),
		}, { merge: true });
	}

	async update(id: string, data: Partial<User>): Promise<void> {
		await updateDoc(doc(db, 'users', id), data as any);
	}

	async delete(id: string): Promise<void> {
		await deleteDoc(doc(db, 'users', id));
	}
}

export default new UsersRepository();

