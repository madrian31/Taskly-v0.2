import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AuthService from '../../services/authService'
import UsersRepository from '../../repository/UsersRepository'

interface Props {
  children: ReactNode
  allowedRoles: string[]
  allowedStatuses?: string[]
}

export default function RequireRole({ children, allowedRoles, allowedStatuses }: Props) {
   const [status, setStatus] = useState<string | undefined>(undefined)
  const [authUser, setAuthUser] = useState<any | null | undefined>(undefined)
  const [role, setRole] = useState<string | undefined>(undefined)
 

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (u: any) => {
      setAuthUser(u ?? null)

      if (u) {
        try {
          const userDoc = await UsersRepository.getById(u.uid)
          const fetchedStatus = userDoc?.status ?? 'active'
          const fetchedRole = userDoc?.role ?? 'user'
          setStatus(fetchedStatus)
          setRole(fetchedRole)
         

          const allowedStatusesInternal = allowedStatuses ?? ['active']

          if (!allowedStatusesInternal.includes(fetchedStatus)) {
            console.warn('RequireRole: user status not allowed', fetchedStatus)
            // Do not sign out here; instead the render will redirect
          }
        } catch (err) {
          console.error('RequireRole: failed to fetch user document', err)
          setStatus('active')
          setRole('user')
        }
      } else {
        setStatus(undefined)
        setRole(undefined)
      }
    })

    return () => unsubscribe()
  }, [allowedStatuses])

  if (authUser === undefined) return <div>Loading...</div>
  if (!authUser) return <Navigate to="/login" replace />

  if (role === undefined || status === undefined) return <div>Loading...</div>

  const allowedStatusesInternal = allowedStatuses ?? ['active']
  if (!allowedStatusesInternal.includes(status)) {
    return <Navigate to="/access-not-available" replace />
  }

  if (allowedRoles.includes('everyone') || allowedRoles.includes(role)) {
    return <>{children}</>
  }
  
  return <Navigate to="/access-not-available" replace />
}
