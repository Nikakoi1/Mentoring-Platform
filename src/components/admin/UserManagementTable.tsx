'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getAllUsers, updateUserProfile } from '@/lib/services/database'
import type { User } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

export function UserManagementTable() {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [errorKey, setErrorKey] = useState('')
  const { t } = useTranslations({
    namespace: 'admin.users',
    defaults: {
      'title': 'User Management',
      'loading': 'Loading users...',
      'error.permission': 'You do not have permission to view this page.',
      'error.load': 'Failed to load users. Please try again later.',
      'error.updateStatus': 'Failed to update user status',
      'filters.name.label': 'Name',
      'filters.name.placeholder': 'Search by name',
      'filters.email.label': 'Email',
      'filters.email.placeholder': 'Search by email',
      'filters.region.label': 'Region',
      'filters.region.placeholder': 'Filter by region',
      'filters.role.label': 'Role',
      'filters.role.options.all': 'All',
      'filters.role.options.mentee': 'Mentee',
      'filters.role.options.mentor': 'Mentor',
      'filters.role.options.coordinator': 'Coordinator',
      'filters.status.label': 'Status',
      'filters.status.options.all': 'All',
      'filters.status.options.active': 'Active',
      'filters.status.options.inactive': 'Inactive',
      'filters.joinedFrom.label': 'Joined (From)',
      'filters.joinedTo.label': 'Joined (To)',
      'table.headers.name': 'Name',
      'table.headers.email': 'Email',
      'table.headers.role': 'Role',
      'table.headers.region': 'Region',
      'table.headers.status': 'Status',
      'table.headers.joined': 'Joined',
      'table.headers.actions': 'Actions',
      'table.empty': 'No users match the current filters.',
      'status.active': 'Active',
      'status.inactive': 'Inactive',
      'value.missing': 'N/A',
      'value.regionPlaceholder': '—',
      'action.view': 'View',
      'action.deactivate': 'Deactivate',
      'action.activate': 'Activate'
    }
  })
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    role: 'all',
    status: 'all',
    region: '',
    joinedFrom: '',
    joinedTo: ''
  })
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' }>({
    key: 'created_at',
    direction: 'desc'
  })

  useEffect(() => {
    const fetchUsers = async () => {
      if (userProfile?.role !== 'coordinator') {
        setErrorKey('error.permission')
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await getAllUsers()
      if (error) {
        setErrorKey('error.load')
        console.error(error)
      } else if (data) {
        setUsers(data)
        setErrorKey('')
      }
      setLoading(false)
    }
    fetchUsers()
  }, [userProfile])

  const handleToggleActive = async (userToUpdate: User) => {
    const newStatus = !userToUpdate.active
    const { error } = await updateUserProfile(userToUpdate.id, { active: newStatus })
    if (error) {
      alert(`${t('error.updateStatus')}: ${error.message}`)
    } else {
      setUsers(users.map(u => u.id === userToUpdate.id ? { ...u, active: newStatus } : u))
    }
  }

  const handleSort = (key: keyof User) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedFilteredUsers = useMemo(() => {
    const { name, email, role, status, region, joinedFrom, joinedTo } = filters
    const filtered = users.filter(user => {
      const matchesName = name ? (user.full_name || '').toLowerCase().includes(name.toLowerCase()) : true
      const matchesEmail = email ? user.email.toLowerCase().includes(email.toLowerCase()) : true
      const matchesRole = role === 'all' ? true : user.role === role
      const matchesStatus = status === 'all' ? true : (status === 'active' ? user.active : !user.active)
      const matchesRegion = region ? (user.region || '').toLowerCase().includes(region.toLowerCase()) : true
      const userDate = new Date(user.created_at)
      const matchesFrom = joinedFrom ? userDate >= new Date(joinedFrom) : true
      const matchesTo = joinedTo ? userDate <= new Date(joinedTo) : true

      return matchesName && matchesEmail && matchesRole && matchesStatus && matchesRegion && matchesFrom && matchesTo
    })

    const sorted = [...filtered].sort((a, b) => {
      const { key, direction } = sortConfig
      const multiplier = direction === 'asc' ? 1 : -1
      const aValue = a[key]
      const bValue = b[key]

      if (aValue === bValue) return 0

      if (aValue === undefined || aValue === null) return -1 * multiplier
      if (bValue === undefined || bValue === null) return 1 * multiplier

      if (aValue < bValue) return -1 * multiplier
      if (aValue > bValue) return 1 * multiplier
      return 0
    })

    return sorted
  }, [users, filters, sortConfig])

  const renderSortIndicator = (key: keyof User) => {
    if (sortConfig.key !== key) return null
    return <span className="ml-1">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
  }

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <div className="text-center p-8">{t('loading')}</div>
  }

  if (errorKey) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{t(errorKey)}</div>
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('filters.name.label')}</label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('filters.name.placeholder')}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('filters.email.label')}</label>
            <input
              type="text"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('filters.email.placeholder')}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('filters.region.label')}</label>
            <input
              type="text"
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('filters.region.placeholder')}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('filters.role.label')}</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('filters.role.options.all')}</option>
              <option value="mentee">{t('filters.role.options.mentee')}</option>
              <option value="mentor">{t('filters.role.options.mentor')}</option>
              <option value="coordinator">{t('filters.role.options.coordinator')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('filters.status.label')}</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('filters.status.options.all')}</option>
              <option value="active">{t('filters.status.options.active')}</option>
              <option value="inactive">{t('filters.status.options.inactive')}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('filters.joinedFrom.label')}</label>
              <input
                type="date"
                value={filters.joinedFrom}
                onChange={(e) => handleFilterChange('joinedFrom', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('filters.joinedTo.label')}</label>
              <input
                type="date"
                value={filters.joinedTo}
                onChange={(e) => handleFilterChange('joinedTo', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('full_name')}>
                  <span className="inline-flex items-center">
                    {t('table.headers.name')}
                    {renderSortIndicator('full_name')}
                  </span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>
                  <span className="inline-flex items-center">
                    {t('table.headers.email')}
                    {renderSortIndicator('email')}
                  </span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('role')}>
                  <span className="inline-flex items-center">
                    {t('table.headers.role')}
                    {renderSortIndicator('role')}
                  </span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('region')}>
                  <span className="inline-flex items-center">
                    {t('table.headers.region')}
                    {renderSortIndicator('region')}
                  </span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('active')}>
                  <span className="inline-flex items-center">
                    {t('table.headers.status')}
                    {renderSortIndicator('active')}
                  </span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('created_at')}>
                  <span className="inline-flex items-center">
                    {t('table.headers.joined')}
                    {renderSortIndicator('created_at')}
                  </span>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('table.headers.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFilteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    {t('table.empty')}
                  </td>
                </tr>
              )}
              {sortedFilteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.full_name || t('value.missing')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.region || t('value.regionPlaceholder')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.active ? t('status.active') : t('status.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/profile/${user.id}`}>
                      <span className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer">{t('action.view')}</span>
                    </Link>
                    <button 
                      onClick={() => handleToggleActive(user)}
                      className={user.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                    >
                      {user.active ? t('action.deactivate') : t('action.activate')}
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
