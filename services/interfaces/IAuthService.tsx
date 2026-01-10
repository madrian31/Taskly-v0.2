import {User} from 'firebase/auth';

export interface IAuthService {
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
    signInWithGoogle(): Promise<void>;
    signOutUser(): Promise<void>;
    getCurrentUser(): User | null;
}