import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'firebase/auth'
import Section from '../../components/shared/section/section'
import AuthService from '../../../services/authService'
import UsersRepository from '../../../repository/UsersRepository'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in and redirect
    const checkAuth = () => {
      const currentUser = AuthService.getCurrentUser()
      if (currentUser) {
        // User is already logged in, redirect to dashboard
        // Navigate using React Router instead of forcing a full reload
        navigate('/dashboard', { replace: true })
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
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
            // role: 'user',
          })
        } catch (upsertError) {
          console.error('Failed to upsert user:', upsertError)
        }

        // Check user status before redirecting
        try {
          const userDoc = await UsersRepository.getById(result.user.uid)
          const userStatus = userDoc?.status ?? 'active'

          if (userStatus !== 'active') {
            // User is inactive, navigate to access-not-available
            navigate('/access-not-available', { replace: true })
          } else {
            // User is active, navigate to dashboard
            navigate('/dashboard', { replace: true })
          }
        } catch (error) {
          console.error('Error checking user status:', error)
          // Fallback: navigate to dashboard if status check fails
          navigate('/dashboard', { replace: true })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false)
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