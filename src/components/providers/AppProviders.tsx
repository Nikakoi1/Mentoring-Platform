'use client'

import type { ReactNode } from 'react'

import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { SupabaseTest } from '@/components/debug/SupabaseTest'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
        <SupabaseTest />
        {children}
      </AuthProvider>
    </LanguageProvider>
  )
}
