import '../../App.css'
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider   } from '../../firebase/firebaseConfig';

function Login() {

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/home');
        } catch (error) {
            console.error("Error signing in with popup:", error);
        }
    }

    return (
        <>
            <h1>Login</h1>
            <p>Welcome back! Please log in to continue.</p>
            <button onClick={handleLogin}>Login</button>
        </>
    )
}

export default Login