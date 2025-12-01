'use client'

import { useState, useEffect, useCallback } from 'react'

import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from '@/hooks/useTranslations'
import { createClient, getMenteeClients, updateClient } from '@/lib/services/database'
import type { Client } from '@/lib/types/database'

interface ClientFormState {
  display_name: string
  address?: string
  services_provided?: string
}

export function MenteeClientsList() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState<ClientFormState>({ display_name: '', address: '', services_provided: '' })
  const [formVisible, setFormVisible] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [updatingClientId, setUpdatingClientId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { t } = useTranslations({
    namespace: 'mentee.clients',
    defaults: {
      title: 'Your Clients',
      description: 'Manage the clients you currently serve.',
      sectionManage: 'Client List',
      buttonAdd: 'Add Client',
      buttonSave: 'Save Client',
      buttonUpdate: 'Update Client',
      buttonCancel: 'Cancel',
      buttonActivate: 'Activate',
      buttonDeactivate: 'Deactivate',
      buttonEdit: 'Edit',
      loading: 'Loading your clients...',
      empty: 'You have not added any clients yet.',
      statusLabel: 'Status:',
      statusActive: 'Active',
      statusInactive: 'Inactive',
      formTitleNew: 'Add New Client',
      formTitleEdit: 'Edit Client',
      formLabelName: 'Client Name / Identification Code',
      formLabelAddress: 'Address',
      formLabelServices: 'Services Provided',
      formPlaceholderName: 'e.g., ABC Enterprises / 123456789',
      formPlaceholderAddress: 'Street, City, Country',
      formPlaceholderServices: 'Describe the services you deliver',
      errorLoad: 'Failed to load clients. Please try again later.',
      errorSave: 'Unable to save the client. Please try again.',
      successSave: 'Client saved successfully.'
    }
  })

  const resetForm = () => {
    setFormState({ display_name: '', address: '', services_provided: '' })
    setEditingClient(null)
    setFormVisible(false)
  }

  const loadClients = useCallback(async () => {
    if (!user?.id) {
      setClients([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await getMenteeClients(user.id)
    if (error) {
      console.error('Failed to load clients', error)
      setStatusMessage({ type: 'error', text: t('errorLoad') })
    } else {
      setClients(data ?? [])
      setStatusMessage(null)
    }
    setLoading(false)
  }, [t, user?.id])

  useEffect(() => {
    void loadClients()
  }, [loadClients])

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user?.id || !formState.display_name.trim()) {
      setStatusMessage({ type: 'error', text: t('errorSave') })
      return
    }
    setSubmitting(true)
    setStatusMessage(null)

    if (editingClient) {
      const { error } = await updateClient(editingClient.id, formState)
      if (error) {
        console.error('Failed to update client', error)
        setStatusMessage({ type: 'error', text: t('errorSave') })
      } else {
        setStatusMessage({ type: 'success', text: t('successSave') })
        await loadClients()
        resetForm()
      }
    } else {
      const { error } = await createClient(user.id, formState)
      if (error) {
        console.error('Failed to create client', error)
        setStatusMessage({ type: 'error', text: t('errorSave') })
      } else {
        setStatusMessage({ type: 'success', text: t('successSave') })
        await loadClients()
        resetForm()
      }
    }

    setSubmitting(false)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setFormState({
      display_name: client.display_name,
      address: client.address || '',
      services_provided: client.services_provided || ''
    })
    setFormVisible(true)
  }

  const handleToggleActive = async (client: Client) => {
    setUpdatingClientId(client.id)
    const { error } = await updateClient(client.id, { active: !client.active })
    if (error) {
      console.error('Failed to toggle client active state', error)
      setStatusMessage({ type: 'error', text: t('errorSave') })
    } else {
      setClients(prev => prev.map(c => (c.id === client.id ? { ...c, active: !client.active } : c)))
      setStatusMessage(null)
    }
    setUpdatingClientId(null)
  }

  const renderStatusBadge = (client: Client) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${client.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
      {client.active ? t('statusActive') : t('statusInactive')}
    </span>
  )

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600">{t('description')}</p>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => {
              setStatusMessage(null)
              setFormVisible(true)
              setEditingClient(null)
              setFormState({ display_name: '', address: '', services_provided: '' })
            }}
          >
            {t('buttonAdd')}
          </button>
        </div>

        {formVisible && (
          <form className="space-y-4 border p-4 rounded-md" onSubmit={handleFormSubmit}>
            <h2 className="text-lg font-semibold">
              {editingClient ? t('formTitleEdit') : t('formTitleNew')}
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1">{t('formLabelName')}</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={formState.display_name}
                onChange={(e) => setFormState(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder={t('formPlaceholderName')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('formLabelAddress')}</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={formState.address}
                onChange={(e) => setFormState(prev => ({ ...prev, address: e.target.value }))}
                placeholder={t('formPlaceholderAddress')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('formLabelServices')}</label>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={3}
                value={formState.services_provided}
                onChange={(e) => setFormState(prev => ({ ...prev, services_provided: e.target.value }))}
                placeholder={t('formPlaceholderServices')}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border rounded-md"
                onClick={resetForm}
              >
                {t('buttonCancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? `${t('buttonSave')}...` : editingClient ? t('buttonUpdate') : t('buttonSave')}
              </button>
            </div>
          </form>
        )}

        {statusMessage && (
          <div className={`p-3 rounded-md text-sm ${statusMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {statusMessage.text}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500">{t('loading')}</div>
        ) : clients.length === 0 ? (
          <div className="text-center text-gray-500">{t('empty')}</div>
        ) : (
          <div className="space-y-4">
            {clients.map(client => (
              <div key={client.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{client.display_name}</h3>
                    {renderStatusBadge(client)}
                  </div>
                  {client.address && <p className="text-sm text-gray-600">{client.address}</p>}
                  {client.services_provided && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">{t('formLabelServices')}:</span> {client.services_provided}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 text-sm border rounded-md"
                    onClick={() => handleEditClient(client)}
                  >
                    {t('buttonEdit')}
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 text-sm rounded-md text-white ${client.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} disabled:opacity-50`}
                    onClick={() => handleToggleActive(client)}
                    disabled={updatingClientId === client.id}
                  >
                    {client.active ? t('buttonDeactivate') : t('buttonActivate')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
