import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import '../../App.css';

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/home');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        
        try {
            await signInWithPopup(auth, provider);
            // User will be redirected by onAuthStateChanged
        } catch (error) {
            console.error('Error signing in with Google:', error);
            alert('Failed to sign in with Google');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh' 
        }}>
            <h1>Login</h1>
            <p>Welcome back! Please log in to continue.</p>
            <button 
                onClick={handleGoogleSignIn}
                style={{ 
                    padding: '12px 24px', 
                    fontSize: '16px', 
                    cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                Sign in with Google
            </button>
        </div>
    );
}

export default Login;