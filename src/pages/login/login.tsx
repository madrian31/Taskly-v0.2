import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'firebase/auth'
import Section from '../../components/shared/section/section'
import AuthService from '../../../services/authService'
import UsersRepository from '../../../repository/UsersRepository'
import { User as FirebaseUser } from 'firebase/auth'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user: User | null) => {
      if (user) {
        // Use SPA navigation to dashboard when already authenticated
        navigate('/dashboard')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [navigate])

  const handleGoogleSignIn = async () => {
    try {
      const result = await AuthService.signInWithGoogle()
      if (result && result.user) {
        // Determine photo URL: prefer User.photoURL, fall back to providerData
        const providerPhoto = result.user.providerData && result.user.providerData.length > 0
          ? (result.user.providerData[0] as any).photoURL
          : undefined
        const photo = result.user.photoURL ?? providerPhoto ?? undefined

        // Upsert user record in Firestore using auth UID as doc id
        try {
          console.log('Upserting user', { uid: result.user.uid, photo, displayName: result.user.displayName })
          await UsersRepository.upsertByUid(result.user.uid, {
            displayName: result.user.displayName ?? undefined,
            email: result.user.email ?? undefined,
            photoURL: photo,
            role: 'user',
          })
        } catch (upsertError) {
          console.error('Failed to upsert user:', upsertError)
        }

        // Immediately redirect to clear popup/COOP warnings
        // and allow dashboard to reload/upsert any additional data
        const target = `${window.location.origin}${window.location.pathname}?reload=1&newUser=1#/dashboard`
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
