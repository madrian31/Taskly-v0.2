import '../App.css'
import { Link } from 'react-router-dom';

function Login() {
    return (
        <>
            <h1>Login</h1>
            <p>Welcome back! Please log in to continue.</p>
            <Link to="/home">Go to Home</Link>
        </>
    )
}

export default Login