import '../../App.css'
import { useNavigate } from 'react-router-dom';

function Login() {

    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/home');
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