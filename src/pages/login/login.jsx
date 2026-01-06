import '../../App.css'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from "../../firebase/firebaseConfig";
import { signInWithRedirect, getRedirectResult } from "firebase/auth";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithRedirect(auth, provider);
      // Do NOT navigate here; the redirect reloads the page
    } catch (error) {
      console.error("Error signing in with redirect:", error);
    }
  };

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("Logged in user:", result.user);
          navigate('/home'); // now we navigate after successful login
        }
      })
      .catch((error) => {
        console.error("Redirect login error:", error);
      });
  }, [navigate]);

  return (
    <>
      <h1>Login</h1>
      <p>Welcome back! Please log in to continue.</p>
      <button onClick={handleLogin}>Login with Google</button>
    </>
  );
}

export default Login;