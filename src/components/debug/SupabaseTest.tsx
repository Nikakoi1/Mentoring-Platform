'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('[SupabaseTest] Component mounted')
    console.log('[SupabaseTest] Environment check:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
    })

    const testConnection = async () => {
      console.log('[SupabaseTest] Starting connection test...')
      
      // Add timeout
      const timeout = setTimeout(() => {
        console.log('[SupabaseTest] Query timeout - setting error status')
        setError('Connection timeout')
        setStatus('error')
      }, 10000)

      try {
        console.log('[SupabaseTest] Attempting simple health check...')
        // Try a simple health check first
        const { data, error } = await supabase.from('system_settings').select('id').limit(1)
        clearTimeout(timeout)
        console.log('[SupabaseTest] Health check result:', { data, error })
        
        if (error) {
          console.error('[SupabaseTest] Health check failed, trying translations...', error)
          // Try translations as fallback
          const { error: transError } = await supabase.from('translations').select('count').limit(1)
          if (transError) {
            console.error('[SupabaseTest] Both queries failed:', transError)
            setError(`Health check: ${error.message}, Translations: ${transError.message}`)
            setStatus('error')
          } else {
            console.log('[SupabaseTest] Translations query successful!')
            setStatus('connected')
          }
        } else {
          console.log('[SupabaseTest] Health check successful!')
          setStatus('connected')
        }
      } catch (err) {
        clearTimeout(timeout)
        console.error('[SupabaseTest] Exception:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="fixed bottom-4 left-4 p-3 bg-white border rounded-lg shadow-lg text-sm max-w-xs">
      <div className="font-semibold mb-1">Supabase Connection:</div>
      {status === 'loading' && (
        <div>
          <div className="text-yellow-600">Testing...</div>
          <div className="text-xs text-gray-500 mt-1">Check console for details</div>
        </div>
      )}
      {status === 'connected' && <div className="text-green-600">✓ Connected</div>}
      {status === 'error' && (
        <div>
          <div className="text-red-600">✗ Error</div>
          <div className="text-xs text-gray-500 mt-1">{error}</div>
        </div>
      )}
      <div className="text-xs text-gray-400 mt-2">
        URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20)}...
      </div>
    </div>
  )
}
