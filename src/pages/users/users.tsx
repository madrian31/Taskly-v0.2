import React, { useEffect, useState, useRef } from 'react'
import './users.css'
import UsersRepository from '../../../repository/UsersRepository'
import { User } from '../../../model/users'
import { auth } from '../../firebase/firebase'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [currentUid, setCurrentUid] = useState<string | null>(null)
  const [currentUserDoc, setCurrentUserDoc] = useState<User | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchUsers = () => {
      console.log('Fetching users...')
      setLoading(true)
      UsersRepository.getAll()
        .then((res: any) => {
          console.log('Users fetched', res)
          if (mounted) {
            setUsers(res)
            setFilteredUsers(res)
          }
        })
        .catch(err => {
          console.error('Users fetch error', err)
          if (mounted) setError(err?.message ?? 'Failed to load users')
        })
        .finally(() => { if (mounted) setLoading(false) })
    }

    const unsub = onAuthStateChanged(auth, async user => {
      console.log('onAuthStateChanged', user)
      if (!user) {
        signInAnonymously(auth)
          .then(() => console.log('Anonymous sign-in successful'))
          .catch(e => console.error('Anonymous sign-in failed', e))
      } else {
        // track current signed-in UID and fetch their user doc (for role/permissions)
        setCurrentUid(user.uid)
        try {
          const me = await UsersRepository.getById(user.uid)
          setCurrentUserDoc(me as any)
        } catch (e) {
          console.warn('Failed to fetch current user doc', e)
          setCurrentUserDoc(null)
        }

        fetchUsers()
      }
    })

    return () => { mounted = false; unsub() }
  }, [])

  // Filter users based on search and filters
  useEffect(() => {
    let result = [...users]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(u => 
        u.displayName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(u => u.status === statusFilter)
    }

    setFilteredUsers(result)
  }, [searchQuery, roleFilter, statusFilter, users])

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleAddUser = () => {
    showNotification('Add user functionality coming soon', 'success')
  }

  const handleEdit = (user: User) => {
    setEditingUser({ ...user })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return
    // Permission check: only allow editing own document or allow if current user is admin
    if (!currentUid) {
      showNotification('Not signed in — cannot save changes', 'error')
      return
    }
    if (currentUid !== editingUser.id && currentUserDoc?.role !== 'admin') {
      console.warn('Permission denied: current user', currentUid, 'cannot edit', editingUser.id)
      showNotification('You do not have permission to edit this user', 'error')
      return
    }
    
    try {
      // Persist changes to Firestore
      const payload: any = {}
      if (editingUser.displayName !== undefined) payload.displayName = editingUser.displayName
      if (editingUser.email !== undefined) payload.email = editingUser.email
      if (editingUser.role !== undefined) payload.role = editingUser.role
      if (editingUser.department !== undefined) payload.department = editingUser.department
      if (editingUser.status !== undefined) payload.status = editingUser.status
      // only add lastActive when it's non-null/defined
      if (editingUser.lastActive != null) payload.lastActive = editingUser.lastActive

      console.log('🔄 Updating user in Firestore...')
      console.log('User ID:', editingUser.id)
      console.log('Payload:', JSON.stringify(payload, null, 2))

      await UsersRepository.update(editingUser.id, payload as any)
      console.log('✅ Update successful!')

      // Verify stored doc
      const stored = await UsersRepository.getById(editingUser.id)
      console.log('📦 Stored user after update:', JSON.stringify(stored, null, 2))

      // Update local state
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u))
      showNotification('User updated successfully', 'success')
      setShowEditModal(false)
      setEditingUser(null)
    } catch (err: any) {
      console.error('❌ Failed to update user in Firestore')
      console.error('Error:', err)
      console.error('Error message:', err?.message)
      console.error('Error code:', err?.code)
      showNotification(`Failed to update user: ${err?.message || 'Unknown error'}`, 'error')
    }
  }

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'inactive' : 'active'
        showNotification(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success')
        return { ...u, status: newStatus }
      }
      return u
    }))
  }

  const handleDelete = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      setUsers(users.filter(u => u.id !== userId))
      showNotification('User deleted successfully', 'success')
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return '?'
    const parts = name.split(' ')
    return parts.length > 1 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case 'admin': return 'badge-admin'
      case 'manager': return 'badge-manager'
      default: return 'badge-user'
    }
  }

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'active': return 'badge-active'
      case 'inactive': return 'badge-inactive'
      case 'pending': return 'badge-pending'
      default: return 'badge-active'
    }
  }

  return (
    <div className="user-management">
      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="um-header">
        <h1 className="um-title">User Management</h1>
        <button className="btn-primary" onClick={handleAddUser}>
          <span className="btn-icon">+</span>
          Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="um-controls">
        <div className="search-box">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          <select 
            className="filter-select" 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>

          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Loading/Error States */}
      {loading && <div className="loading-state">Loading users...</div>}
      {error && <div className="error-state">Error: {error}</div>}

      {/* Users Table */}
      {!loading && !error && (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Department</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                        ) : (
                          <div className="user-avatar user-avatar-placeholder">
                            {getInitials(user.displayName || user.email)}
                          </div>
                        )}
                        <div className="user-info">
                          <div className="user-name">{user.displayName || 'No name'}</div>
                          <div className="user-email">{user.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="cell-department">{user.department || 'N/A'}</td>
                    <td className="cell-date">{user.lastActive || 'Never'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn action-btn-edit"
                          onClick={() => {
                            if (!currentUid) { showNotification('Not signed in', 'error'); return }
                            if (currentUid !== user.id && currentUserDoc?.role !== 'admin') { showNotification('You do not have permission to edit this user', 'error'); return }
                            handleEdit(user)
                          }}
                          title="Edit user"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.333 2A1.886 1.886 0 0 1 14 4.667l-9 9-3.667 1 1-3.667 9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          className="action-btn action-btn-toggle"
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0z" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M8 8V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                        <button 
                          className="action-btn action-btn-delete"
                          onClick={() => handleDelete(user.id, user.displayName || user.email || 'this user')}
                          title="Delete user"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit User</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={editingUser.displayName || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-input"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select 
                  className="form-select"
                  value={editingUser.role || 'user'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select 
                  className="form-select"
                  value={editingUser.department || 'Engineering'}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={editingUser.status || 'active'}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}