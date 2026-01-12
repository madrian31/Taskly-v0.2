import { User, UserCredential } from 'firebase/auth';

export interface IAuthService {
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
    signInWithGoogle(): Promise<UserCredential>;
    signOutUser(): Promise<void>;
    getCurrentUser(): User | null;
}