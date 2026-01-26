import React, { useEffect, useState } from 'react'
import Section from '../../components/shared/section/section'
import '../../App.css'
import UsersRepository from '../../../repository/UsersRepository'
import { User } from '../../../model/users'
import { auth } from '../../firebase/firebase'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchUsers = () => {
      console.log('Fetching users...')
      setLoading(true)
      UsersRepository.getAll()
        .then(res => { console.log('Users fetched', res); if (mounted) setUsers(res) })
        .catch(err => { console.error('Users fetch error', err); if (mounted) setError(err?.message ?? 'Failed to load users') })
        .finally(() => { if (mounted) setLoading(false) })
    }

    const unsub = onAuthStateChanged(auth, user => {
      console.log('onAuthStateChanged', user)
      if (!user) {
        signInAnonymously(auth)
          .then(() => console.log('Anonymous sign-in successful'))
          .catch(e => console.error('Anonymous sign-in failed', e))
      } else {
        // user available — fetch users now
        fetchUsers()
      }
    })

    return () => { mounted = false; unsub() }
  }, [])

  return (
    <Section id="users">
      <h1>Users</h1>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <ul>
              {users.map(u => (
                <li key={u.id} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600 }}>{u.displayName ?? u.email ?? 'No name'}</div>
                  {u.email && <div style={{ color: '#555' }}>{u.email}</div>}
                  <div style={{ fontSize: 12, color: '#666' }}>Role: {u.role}</div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Section>
  )
}