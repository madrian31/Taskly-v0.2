import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AuthService from '../../services/authService'
import UsersRepository from '../../repository/UsersRepository'
import { User } from 'firebase/auth'

interface Props {
  children: ReactNode
}

export default function RequireAuth({ children }: Props) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [status, setStatus] = useState<string | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (u: User | null) => {
      setUser(u ?? null)

      if (u) {
        try {
          const userDoc = await UsersRepository.getById(u.uid)
          const fetchedStatus = userDoc?.status ?? 'active'
          setStatus(fetchedStatus)
        } catch (err) {
          console.error('RequireAuth: failed to fetch user document', err)
          setStatus('active') // fallback to active if fetch fails
        }
      } else {
        setStatus(undefined)
      }
    })

    return () => unsubscribe()
  }, [])

  // Still loading auth state
  if (user === undefined) return <div>Loading...</div>
  
  // Not logged in
  if (!user) return <Navigate to="/login" replace />

  // Still loading user status from Firestore
  if (status === undefined) return <div>Loading...</div>

  // User is inactive → block before MainLayout renders
  if (status !== 'active') {
    return <Navigate to="/access-not-available" replace />
  }

  return <>{children}</>
}
