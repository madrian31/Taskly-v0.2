import '../../App.css'
import Section from '../../components/shared/section/section'
import { useNavigate } from 'react-router-dom'
import AuthService from '../../../services/authService'

function AccessNotAvailable() {
    const navigate = useNavigate()
    
    const handleGoToLogin = async () => {
        try {
            await AuthService.signOutUser()
            // Then navigate to login
        } catch (error) {
            console.error('Error signing out:', error)
            navigate('/login')
        }
    }
    
    return (
        <Section id="access-not-available">
            <h1>Access Not Available</h1>
            <p>You do not have the necessary permissions to access this page.</p>
            <button onClick={handleGoToLogin}>Go to Login</button>
        </Section>
    )
}

export default AccessNotAvailable