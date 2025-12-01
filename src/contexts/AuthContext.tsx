'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthChangeEvent, AuthError, Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getUserProfile } from '@/lib/services/database'
import type { UserWithRole } from '@/lib/types/database'

type AuthContextType = {
  user: User | null
  userProfile: UserWithRole | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserWithRole | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserProfile = async (user: User) => {
      const { data: profile } = await getUserProfile(user.id)
      setUserProfile(profile)
    }

    const syncSessionState = async (session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    }

    const handleSessionError = async (error: AuthError | Error) => {
      console.error('Failed to load auth session', error)
      const message = error.message ?? ''
      if (message.includes('Invalid Refresh Token') || message.includes('refresh_token_not_found')) {
        await supabase.auth.signOut()
      }
      await syncSessionState(null)
    }

    const initializeSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          await handleSessionError(error)
          return
        }
        await syncSessionState(data.session)
      } catch (err) {
        console.error('Unexpected auth error', err)
        await syncSessionState(null)
      }
    }

    initializeSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      void syncSessionState(session)
      void fetch('/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event, session })
      }).catch(error => {
        console.error('Failed to sync auth session to server', error)
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
