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
        const base = (import.meta as any).env.BASE_URL || '/'
        window.location.replace(`${base}home`)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  const handleGoogleSignIn = async () => {
    try {
      await AuthService.signInWithGoogle()
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
