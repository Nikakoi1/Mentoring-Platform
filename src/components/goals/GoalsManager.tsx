'use client'

import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from '@/hooks/useTranslations'
import {
  createGoal,
  deleteGoal,
  getPairingGoals,
  getUserPairings,
  updateGoal
} from '@/lib/services/database'
import type {
  Goal,
  GoalPriority,
  GoalStatus,
  PairingWithUsers
} from '@/lib/types/database'

const PRIORITY_OPTIONS: GoalPriority[] = ['low', 'medium', 'high']
const STATUS_OPTIONS: GoalStatus[] = ['not-started', 'in-progress', 'completed', 'on-hold']

type FormValues = {
  title: string
  description: string
  category: string
  targetDate: string
  priority: GoalPriority
  status: GoalStatus
}

const INITIAL_FORM: FormValues = {
  title: '',
  description: '',
  category: '',
  targetDate: '',
  priority: 'medium',
  status: 'not-started'
}

export function GoalsManager() {
  const { user, userProfile } = useAuth()
  const { t } = useTranslations({
    namespace: 'goals.manage',
    defaults: {
      'loading.profile': 'Loading your profile...',
      'loading.pairings': 'Loading your mentee pairings...',
      'loading.goals': 'Loading goals...',
      'error.loadPairings': 'Failed to load your mentor pairings. Please try again later.',
      'error.loadGoals': 'Failed to load goals for this pairing.',
      'error.noPairings': 'You must be paired with a mentee to manage goals.',
      'error.roleRestricted': 'Only mentors can manage mentorship goals.',
      'error.form.selectPairing': 'Please select a pairing before creating a goal.',
      'error.generic': 'Something went wrong. Please try again.',
      'title': 'Mentorship Goals',
      'pairing.label': 'Select Mentee Pairing',
      'pairing.placeholder': '-- Choose a mentee --',
      'empty.goals': 'No goals yet. Use the form to create your first goal.',
      'list.heading': 'Existing Goals',
      'list.table.goal': 'Goal',
      'list.table.category': 'Category',
      'list.table.priority': 'Priority',
      'list.table.status': 'Status',
      'list.table.targetDate': 'Target Date',
      'list.table.actions': 'Actions',
      'list.value.none': '—',
      'cta.edit': 'Edit',
      'cta.delete': 'Delete',
      'cta.cancelEdit': 'Cancel edit',
      'form.heading.create': 'Create New Goal',
      'form.heading.edit': 'Edit Goal',
      'form.field.title': 'Title',
      'form.field.description': 'Description (Optional)',
      'form.field.category': 'Category',
      'form.field.targetDate': 'Target Date (Optional)',
      'form.field.priority': 'Priority',
      'form.field.status': 'Status',
      'form.placeholder.title': 'e.g., Master React Hooks',
      'form.placeholder.description': 'Specific, measurable, achievable, relevant, time-bound objectives.',
      'form.placeholder.category': 'e.g., Technical Skills',
      'form.placeholder.targetDate': '2025-12-31',
      'form.cta.create': 'Create Goal',
      'form.cta.update': 'Save Changes',
      'form.cta.loading': 'Saving...',
      'priority.low': 'Low',
      'priority.medium': 'Medium',
      'priority.high': 'High',
      'status.not-started': 'Not Started',
      'status.in-progress': 'In Progress',
      'status.completed': 'Completed',
      'status.on-hold': 'On Hold',
      'confirm.delete': 'Are you sure you want to delete this goal?',
      'toast.created': 'Goal created successfully!',
      'toast.updated': 'Goal updated successfully!',
      'toast.deleted': 'Goal deleted successfully!'
    }
  })

  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [selectedPairingId, setSelectedPairingId] = useState('')
  const [goals, setGoals] = useState<Goal[]>([])
  const [loadingPairings, setLoadingPairings] = useState(true)
  const [loadingGoals, setLoadingGoals] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formValues, setFormValues] = useState<FormValues>(INITIAL_FORM)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const resolvedError = useMemo(() => (errorKey ? t(errorKey) : errorMessage), [errorKey, errorMessage, t])

  const isMentor = userProfile?.role === 'mentor'

  useEffect(() => {
    const fetchPairings = async () => {
      if (!user?.id || !userProfile) {
        return
      }

      if (!isMentor) {
        setLoadingPairings(false)
        setPairings([])
        setErrorKey('error.roleRestricted')
        setErrorMessage('')
        return
      }

      setLoadingPairings(true)
      setErrorKey(null)
      setErrorMessage('')

      const { data, error } = await getUserPairings(user.id)
      if (error) {
        console.error(error)
        setErrorKey('error.loadPairings')
        setErrorMessage('')
        setLoadingPairings(false)
        return
      }

      const mentorPairings = (data ?? []).filter((pairing: PairingWithUsers) => pairing.mentor_id === user.id)
      setPairings(mentorPairings)

      if (mentorPairings.length > 0) {
        setSelectedPairingId((prev) => prev || mentorPairings[0].id)
      }

      setLoadingPairings(false)
    }

    void fetchPairings()
  }, [user?.id, userProfile, isMentor])

  useEffect(() => {
    const fetchGoals = async () => {
      if (!selectedPairingId || !isMentor) {
        setGoals([])
        return
      }
      setLoadingGoals(true)
      setErrorKey(null)
      setErrorMessage('')

      const { data, error } = await getPairingGoals(selectedPairingId)
      if (error) {
        console.error(error)
        setErrorKey('error.loadGoals')
        setErrorMessage('')
      } else {
        setGoals(data ?? [])
      }
      setLoadingGoals(false)
    }

    void fetchGoals()
  }, [selectedPairingId, isMentor])

  const resetForm = () => {
    setFormValues(INITIAL_FORM)
    setEditingGoal(null)
  }

  const handleSelectPairing = (pairingId: string) => {
    setSelectedPairingId(pairingId)
    resetForm()
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setFormValues({
      title: goal.title ?? '',
      description: goal.description ?? '',
      category: goal.category ?? '',
      targetDate: goal.target_date ?? '',
      priority: goal.priority ?? 'medium',
      status: goal.status ?? 'not-started'
    })
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!selectedPairingId) return
    if (!window.confirm(t('confirm.delete'))) return

    const { error } = await deleteGoal(goalId)
    if (error) {
      console.error(error)
      setErrorKey('error.generic')
      setErrorMessage('')
      return
    }

    setGoals((prev) => prev.filter((goal) => goal.id !== goalId))
    if (editingGoal?.id === goalId) {
      resetForm()
    }
    alert(t('toast.deleted'))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user?.id || !selectedPairingId || !isMentor) {
      setErrorKey('error.form.selectPairing')
      setErrorMessage('')
      return
    }

    setSubmitting(true)
    setErrorKey(null)
    setErrorMessage('')

    const selectedPairing = pairings.find((pairing) => pairing.id === selectedPairingId)
    if (!selectedPairing) {
      setErrorKey('error.form.selectPairing')
      setSubmitting(false)
      return
    }

    const payload = {
      pairing_id: selectedPairingId,
      title: formValues.title.trim(),
      description: formValues.description.trim() || undefined,
      category: formValues.category.trim() || undefined,
      target_date: formValues.targetDate || undefined,
      priority: formValues.priority,
      status: formValues.status
    }

    if (!payload.title) {
      setErrorMessage(t('form.field.title') + ' ' + t('error.generic'))
      setSubmitting(false)
      return
    }

    if (editingGoal) {
      const { error } = await updateGoal(editingGoal.id, payload)
      if (error) {
        console.error(error)
        setErrorKey('error.generic')
        setErrorMessage('')
      } else {
        alert(t('toast.updated'))
        setGoals((prev) => prev.map((goal) => (goal.id === editingGoal.id ? { ...goal, ...payload } as Goal : goal)))
        resetForm()
      }
    } else {
      const { data, error } = await createGoal({ ...payload, mentee_id: selectedPairing.mentee_id })
      if (error) {
        console.error(error)
        setErrorKey('error.generic')
        setErrorMessage('')
      } else if (data) {
        alert(t('toast.created'))
        setGoals((prev) => [data, ...prev])
        resetForm()
      }
    }

    setSubmitting(false)
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-600">{t('loading.profile')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isMentor) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-600">{t('error.roleRestricted')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        </div>

        {resolvedError && (
          <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
            {resolvedError}
          </div>
        )}

        {loadingPairings ? (
          <div className="text-center p-8 text-gray-600">{t('loading.pairings')}</div>
        ) : pairings.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-600">{t('error.noPairings')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow space-y-3">
              <label className="block text-sm font-medium text-gray-700">{t('pairing.label')}</label>
              <select
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPairingId}
                onChange={(event) => handleSelectPairing(event.target.value)}
              >
                <option value="" disabled>
                  {t('pairing.placeholder')}
                </option>
                {pairings.map((pairing) => (
                  <option key={pairing.id} value={pairing.id}>
                    {pairing.mentee.full_name || pairing.mentee.email} · {pairing.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">{t('list.heading')}</h2>
                  {editingGoal && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {t('cta.cancelEdit')}
                    </button>
                  )}
                </div>

                {loadingGoals ? (
                  <div className="text-center py-8 text-gray-500">{t('loading.goals')}</div>
                ) : goals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">{t('empty.goals')}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left font-medium text-gray-600">{t('list.table.goal')}</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">{t('list.table.category')}</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">{t('list.table.priority')}</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">{t('list.table.status')}</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">{t('list.table.targetDate')}</th>
                          <th className="px-4 py-2 text-right font-medium text-gray-600">{t('list.table.actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {goals.map((goal) => (
                          <tr key={goal.id}>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{goal.title}</div>
                              {goal.description && (
                                <p className="text-xs text-gray-500">{goal.description}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{goal.category || t('list.value.none')}</td>
                            <td className="px-4 py-3 text-gray-700">{t(`priority.${goal.priority}`)}</td>
                            <td className="px-4 py-3 text-gray-700">{t(`status.${goal.status}`)}</td>
                            <td className="px-4 py-3 text-gray-700">
                              {goal.target_date
                                ? new Date(goal.target_date).toLocaleDateString()
                                : t('list.value.none')}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                type="button"
                                className="text-blue-600 hover:underline text-sm"
                                onClick={() => handleEditGoal(goal)}
                              >
                                {t('cta.edit')}
                              </button>
                              <button
                                type="button"
                                className="text-red-600 hover:underline text-sm"
                                onClick={() => handleDeleteGoal(goal.id)}
                              >
                                {t('cta.delete')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">
                  {editingGoal ? t('form.heading.edit') : t('form.heading.create')}
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.field.title')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.title}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder={t('form.placeholder.title')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.field.description')}
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={formValues.description}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder={t('form.placeholder.description')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.field.category')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.category}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, category: event.target.value }))}
                      placeholder={t('form.placeholder.category')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.field.targetDate')}
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.targetDate}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, targetDate: event.target.value }))}
                      placeholder={t('form.placeholder.targetDate')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('form.field.priority')}
                      </label>
                      <select
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formValues.priority}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, priority: event.target.value as GoalPriority }))}
                      >
                        {PRIORITY_OPTIONS.map((priority) => (
                          <option key={priority} value={priority}>
                            {t(`priority.${priority}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('form.field.status')}
                      </label>
                      <select
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formValues.status}
                        onChange={(event) => setFormValues((prev) => ({ ...prev, status: event.target.value as GoalStatus }))}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {t(`status.${status}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? t('form.cta.loading') : editingGoal ? t('form.cta.update') : t('form.cta.create')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
