'use client'

import { useState } from 'react'

export function SystemSettings() {
  const [settings, setSettings] = useState({
    enableEmailNotifications: true,
    defaultUserRole: 'mentee',
    allowPublicRegistration: true,
  });

  const handleSave = () => {
    // In a real application, you would save these settings to the database
    alert('Settings saved successfully! (This is a placeholder)');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">System Settings</h1>
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Notifications</h3>
            <div className="flex items-center justify-between">
              <label htmlFor="email-notifications" className="text-gray-700">Enable Email Notifications</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  name="email-notifications" 
                  id="email-notifications" 
                  checked={settings.enableEmailNotifications}
                  onChange={() => setSettings(s => ({...s, enableEmailNotifications: !s.enableEmailNotifications}))}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                <label htmlFor="email-notifications" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>
          </div>

          {/* Registration Settings */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg mb-2">User Registration</h3>
            <div className="flex items-center justify-between">
              <label htmlFor="public-registration" className="text-gray-700">Allow Public Registration</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input 
                  type="checkbox" 
                  name="public-registration" 
                  id="public-registration" 
                  checked={settings.allowPublicRegistration}
                  onChange={() => setSettings(s => ({...s, allowPublicRegistration: !s.allowPublicRegistration}))}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                <label htmlFor="public-registration" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="default-role" className="block text-sm font-medium text-gray-700">Default Role for New Users</label>
              <select 
                id="default-role"
                value={settings.defaultUserRole}
                onChange={(e) => setSettings(s => ({...s, defaultUserRole: e.target.value}))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option>mentee</option>
                <option>mentor</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Save Settings
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
