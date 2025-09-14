'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getPairingMessages, sendMessage } from '@/lib/services/database'
import { supabase } from '@/lib/supabase/client'
import type { Message } from '@/lib/types/database'

interface MessagingInterfaceProps {
  pairingId: string;
  recipientId: string;
}

export function MessagingInterface({ pairingId, recipientId }: MessagingInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true)
      const { data, error } = await getPairingMessages(pairingId)
      if (error) {
        setError('Failed to load messages.')
        console.error(error)
      } else if (data) {
        setMessages(data)
      }
      setLoading(false)
    }
    fetchMessages()
  }, [pairingId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!pairingId) return

    const channel = supabase
      .channel(`messages:${pairingId}`)
      .on<Message>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `pairing_id=eq.${pairingId}` },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [pairingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    const messageData = {
      pairing_id: pairingId,
      sender_id: user.id,
      recipient_id: recipientId,
      content: newMessage.trim(),
      message_type: 'direct' as const,
    }

    setNewMessage('')
    const { error: sendError } = await sendMessage(messageData)

    if (sendError) {
      setError('Failed to send message.')
      // Optionally, add the message back to the input to allow user to retry
      setNewMessage(newMessage)
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading messages...</div>
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg flex flex-col h-[80vh]">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Conversation</h1>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map(message => (
            <div key={message.id} className={`flex items-end gap-2 ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md p-3 rounded-lg ${message.sender_id === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${message.sender_id === user?.id ? 'text-blue-200' : 'text-gray-500'}`}>
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t bg-gray-50">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
