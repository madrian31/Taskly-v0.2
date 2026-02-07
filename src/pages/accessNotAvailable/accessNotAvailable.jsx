import '../../App.css'
import Section from '../../components/shared/section/section';

function AccessNotAvailable() {
    return (
           <Section id="access-not-available">
                
                <h1>Access Not Available</h1>
                <p>You do not have the necessary permissions to access this page.</p>
                     
                    <button onClick={() => window.location.href = '/login'}>Go to Login</button>

            </Section>
    )
}
export default AccessNotAvailable