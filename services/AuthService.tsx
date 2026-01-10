import { IAuthService} from "./interfaces/IAuthService";
import  { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User, UserCredential,} from 'firebase/auth';
import { auth } from '../src/firebase/firebase'

class AuthService implements IAuthService {

    onAuthStateChanged(callback: (user: User | null) => void) {
        return onAuthStateChanged(auth, callback)
    }

    async signInWithGoogle(): Promise<void> {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    }

    async signOutUser(): Promise<void> {
        await signOut(auth);
    }

    getCurrentUser(): User | null {
        return auth.currentUser;
    }

}

export default new AuthService();
