'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getAllUsers, updateUserProfile } from '@/lib/services/database'
import type { User } from '@/lib/types/database'

export function UserManagementTable() {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      if (userProfile?.role !== 'coordinator') {
        setError('You do not have permission to view this page.')
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await getAllUsers()
      if (error) {
        setError('Failed to load users. Please try again later.')
        console.error(error)
      } else if (data) {
        setUsers(data)
      }
      setLoading(false)
    }
    fetchUsers()
  }, [userProfile])

  const handleToggleActive = async (userToUpdate: User) => {
    const newStatus = !userToUpdate.active
    const { error } = await updateUserProfile(userToUpdate.id, { active: newStatus })
    if (error) {
      alert(`Failed to update user status: ${error.message}`)
    } else {
      setUsers(users.map(u => u.id === userToUpdate.id ? { ...u, active: newStatus } : u))
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading users...</div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/profile/${user.id}`}>
                      <span className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer">View</span>
                    </Link>
                    <button 
                      onClick={() => handleToggleActive(user)}
                      className={user.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
