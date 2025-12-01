'use client'

import { use } from 'react'
import { MessagingInterface } from '@/components/messaging/MessagingInterface'
import { useSearchParams } from 'next/navigation'

export default function ConversationPage({ params }: { params: Promise<{ pairingId: string }> }) {
  const { pairingId } = use(params)
  const searchParams = useSearchParams()
  const recipientId = searchParams.get('recipientId')

  if (!recipientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">
          Error: Recipient not found.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <MessagingInterface pairingId={pairingId} recipientId={recipientId} />
    </div>
  )
}
