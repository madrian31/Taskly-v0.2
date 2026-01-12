import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'firebase/auth'
import Section from '../../components/shared/section/section'
import AuthService from '../../../services/authService'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user: User | null) => {
      if (user) {
        // Force a full page load to ensure the home page is fully refreshed
        const target = `${window.location.origin}${window.location.pathname}?reload=1#/home`
        window.location.href = target
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  const handleGoogleSignIn = async () => {
    try {
      const result = await AuthService.signInWithGoogle()
      if (result && result.user) {
        const target = `${window.location.origin}${window.location.pathname}?reload=1#/home`
        window.location.href = target
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Section id="login">
      <h1>Login</h1>
      <p>Welcome back! Please log in to continue.</p>
      <button onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
    </Section>
  )
}
