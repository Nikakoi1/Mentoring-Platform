'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserPairings, uploadResource } from '@/lib/services/database'
import { supabase } from '@/lib/supabase/client'
import type { PairingWithUsers, ResourceType } from '@/lib/types/database'

export function UploadResourceForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [pairings, setPairings] = useState<PairingWithUsers[]>([])
  const [selectedPairingId, setSelectedPairingId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [resourceType, setResourceType] = useState<ResourceType>('document')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPairings = async () => {
      if (!user) return
      setLoading(true)
      const { data, error } = await getUserPairings(user.id)
      if (error) {
        setError('Failed to load your pairings. Please try again later.')
        console.error(error)
      } else if (data) {
        setPairings(data)
        if (data.length === 1) {
          setSelectedPairingId(data[0].id)
        }
      }
      setLoading(false)
    }
    fetchPairings()
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedPairingId || !file) {
      setError('Please fill out all required fields and select a file.')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${selectedPairingId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath)

      const resourceData = {
        uploaded_by: user.id,
        pairing_id: selectedPairingId,
        title,
        description,
        resource_type: resourceType,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        is_public: false, // Default to not public
      }

      const { error: dbError } = await uploadResource(resourceData)

      if (dbError) {
        throw dbError
      }

      alert('Resource uploaded successfully!')
      router.push('/resources')
    } catch (err: unknown) {
      let message = 'An unknown error occurred.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        message = String((err as { message: string }).message);
      }
      setError(`Upload failed: ${message}`);
      console.error(err);
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading your pairings...</div>
  }

  if (pairings.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">You must be in an active pairing to upload resources.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 space-y-8 rounded-lg border bg-white shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Upload a New Resource</h1>
        <p className="text-sm text-gray-600">Share a file with your mentor or mentee.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Share with</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPairingId}
              onChange={(e) => setSelectedPairingId(e.target.value)}
              required
            >
              <option value="" disabled>-- Select a pairing --</option>
              {user && pairings.map(p => (
                <option key={p.id} value={p.id}>
                  {user.id === p.mentor_id ? p.mentee.full_name : p.mentor.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Project Brief Template"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A brief summary of what this resource is for."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">File</label>
            <input
              type="file"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleFileChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Resource Type</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as ResourceType)}
            >
              <option value="document">Document</option>
              <option value="presentation">Presentation</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="code">Code</option>
              <option value="link">Link</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? 'Uploading...' : 'Upload Resource'}
        </button>
      </form>
    </div>
  )
}
