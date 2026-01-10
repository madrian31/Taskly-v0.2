import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AuthService from '../../services/authService'
import { User } from 'firebase/auth'

interface Props {
  children: ReactNode
}

export default function RequireAuth({ children }: Props) {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((u: User | null) => {
      setUser(u)
    })

    return () => unsubscribe()
  }, [])

  if (user === undefined) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
