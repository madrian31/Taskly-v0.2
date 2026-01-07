import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Section from '../../components/shared/section/section'
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../firebase/firebase'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/home')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  if (loading) return <div>Loading...</div>

  return (
    <Section>
      <h1>Login</h1>
      <p>Welcome back! Please log in to continue.</p>
      <button onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>
    </Section>
  )
}
