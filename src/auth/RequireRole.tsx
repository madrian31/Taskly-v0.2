import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AuthService from '../../services/authService'
import UsersRepository from '../../repository/UsersRepository'

interface Props {
  children: ReactNode
  allowedRoles: string[]
}

export default function RequireRole({ children, allowedRoles }: Props) {
  const [authUser, setAuthUser] = useState<any | null | undefined>(undefined)
  const [role, setRole] = useState<string | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (u: any) => {
      setAuthUser(u ?? null)

      if (u) {
        try {
          const userDoc = await UsersRepository.getById(u.uid)
          setRole(userDoc?.role ?? 'user')
        } catch (err) {
          console.error('RequireRole: failed to fetch user document', err)
          setRole('user')
        }
      } else {
        setRole(undefined)
      }
    })

    return () => unsubscribe()
  }, [])

  if (authUser === undefined) return <div>Loading...</div>
  if (!authUser) return <Navigate to="/login" replace />

  if (role === undefined) return <div>Loading...</div>

  if (allowedRoles.includes('everyone') || allowedRoles.includes(role)) {
    return <>{children}</>
  }

  return <Navigate to="/dashboard" replace />
}
