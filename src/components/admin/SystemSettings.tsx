'use client'

import { useEffect, useState } from 'react'

import type { SystemSettings as SystemSettingsType, UserRole } from '@/lib/types/database'
import { getSystemSettings, updateSystemSettings } from '@/lib/services/database'
import { useTranslations } from '@/hooks/useTranslations'

const DEFAULT_SETTINGS: SystemSettingsType = {
  id: 'global',
  enableEmailNotifications: true,
  allowPublicRegistration: true,
  defaultUserRole: 'mentee',
  defaultLanguage: 'en'
}

const ROLE_OPTIONS: UserRole[] = ['mentee', 'mentor', 'coordinator']

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettingsType>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { t } = useTranslations({
    namespace: 'adminSystemSettings',
    defaults: {
      title: 'System Settings',
      notificationsHeading: 'Notifications',
      enableEmailNotifications: 'Enable Email Notifications',
      registrationHeading: 'User Registration',
      allowPublicRegistration: 'Allow Public Registration',
      defaultRoleLabel: 'Default Role for New Users',
      loadError: 'Failed to load settings. Please try again later.',
      saveError: 'Unable to save settings. Please try again.',
      saveSuccess: 'Settings saved successfully!',
      saveButton: 'Save Settings',
      savingButton: 'Saving...',
      'roles.mentee': 'Mentee',
      'roles.mentor': 'Mentor',
      'roles.coordinator': 'Coordinator'
    }
  })

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      setError('')

      const { data, error } = await getSystemSettings()
      if (error) {
        console.error('Failed to load system settings', error)
        setError(t('loadError'))
      } else if (data) {
        setSettings(data)
      }

      setLoading(false)
    }

    fetchSettings()
  }, [t])

  const updateSetting = <K extends keyof SystemSettingsType>(key: K, value: SystemSettingsType[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    const { data, error } = await updateSystemSettings(settings)

    if (error) {
      console.error('Failed to save system settings', error)
      setError(t('saveError'))
    } else if (data) {
      setSettings(data)
      setSuccess(t('saveSuccess'))
    }

    setSaving(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{t('notificationsHeading')}</h3>
            <div className="flex items-center justify-between">
              <label htmlFor="email-notifications" className="text-gray-700">{t('enableEmailNotifications')}</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  name="email-notifications" 
                  id="email-notifications" 
                  checked={settings.enableEmailNotifications}
                  disabled={loading || saving}
                  onChange={() => updateSetting('enableEmailNotifications', !settings.enableEmailNotifications)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer disabled:cursor-not-allowed"/>
                <label htmlFor="email-notifications" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>
          </div>

          {/* Registration Settings */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{t('registrationHeading')}</h3>
            <div className="flex items-center justify-between">
              <label htmlFor="public-registration" className="text-gray-700">{t('allowPublicRegistration')}</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  name="public-registration" 
                  id="public-registration" 
                  checked={settings.allowPublicRegistration}
                  disabled={loading || saving}
                  onChange={() => updateSetting('allowPublicRegistration', !settings.allowPublicRegistration)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer disabled:cursor-not-allowed"/>
                <label htmlFor="public-registration" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="default-role" className="block text-sm font-medium text-gray-700">{t('defaultRoleLabel')}</label>
              <select 
                id="default-role"
                value={settings.defaultUserRole}
                disabled={loading || saving}
                onChange={(e) => updateSetting('defaultUserRole', e.target.value as UserRole)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {t(`roles.${role}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(error || success) && (
            <div className={error ? 'p-3 text-sm text-red-600 bg-red-50 rounded-md' : 'p-3 text-sm text-green-600 bg-green-50 rounded-md'}>
              {error || success}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? t('savingButton') : t('saveButton')}
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #3b82f6; /* blue-500 */
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #3b82f6; /* blue-500 */
        }
      `}</style>
    </div>
  );
}
