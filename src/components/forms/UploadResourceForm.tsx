'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'
import { getUserPairings, uploadResource } from '@/lib/services/database'
import { supabase } from '@/lib/supabase/client'
import type { PairingWithUsers, ResourceType } from '@/lib/types/database'
import { useTranslations } from '@/hooks/useTranslations'

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
  const [fetchErrorKey, setFetchErrorKey] = useState('')
  const [formError, setFormError] = useState('')
  const resourcesBucket = process.env.NEXT_PUBLIC_SUPABASE_RESOURCES_BUCKET ?? 'resources'
  const { t } = useTranslations({
    namespace: 'resources.upload',
    defaults: {
      'loading.pairings': 'Loading your pairings...',
      'error.loadPairings': 'Failed to load your pairings. Please try again later.',
      'error.required': 'Please fill out all required fields and select a file.',
      'error.uploadFailed': 'Upload failed: {message}',
      'empty.pairings': 'You must be in an active pairing to upload resources.',
      'title': 'Upload a New Resource',
      'subtitle': 'Share a file with your mentor or mentee.',
      'label.pairing': 'Share with',
      'placeholder.pairing': '-- Select a pairing --',
      'label.title': 'Title',
      'placeholder.title': 'e.g., Project Brief Template',
      'label.description': 'Description (Optional)',
      'placeholder.description': 'A brief summary of what this resource is for.',
      'label.file': 'File',
      'label.type': 'Resource Type',
      'type.document': 'Document',
      'type.presentation': 'Presentation',
      'type.image': 'Image',
      'type.video': 'Video',
      'type.code': 'Code',
      'type.link': 'Link',
      'cta.loading': 'Uploading...',
      'cta.submit': 'Upload Resource',
      'success': 'Resource uploaded successfully!'
    }
  })

  useEffect(() => {
    const fetchPairings = async () => {
      if (!user) {
        setLoading(false)
        setPairings([])
        return
      }
      setLoading(true)
      setFetchErrorKey('')
      const { data, error } = await getUserPairings(user.id)
      if (error) {
        setFetchErrorKey('error.loadPairings')
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
      setFormError(t('error.required'))
      return
    }
    setSubmitting(true)
    setFormError('')

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${selectedPairingId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from(resourcesBucket)
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const resourceData = {
        uploaded_by: user.id,
        pairing_id: selectedPairingId,
        title,
        description,
        resource_type: resourceType,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        is_public: false, // Default to not public
      }

      const { error: dbError } = await uploadResource(resourceData)

      if (dbError) {
        throw dbError
      }

      alert(t('success'))
      router.push('/resources')
    } catch (err: unknown) {
      let message = 'An unknown error occurred.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        message = String((err as { message: string }).message);
      }
      setFormError(t('error.uploadFailed', `Upload failed: ${message}`));
      console.error(err);
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center p-8">{t('loading.pairings')}</div>
  }

  if (fetchErrorKey) {
    return (
      <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">
        {t(fetchErrorKey)}
      </div>
    )
  }

  if (pairings.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <p className="text-gray-600">{t('empty.pairings')}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 space-y-8 rounded-lg border bg-white shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-gray-600">{t('subtitle')}</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('label.pairing')}</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPairingId}
              onChange={(e) => setSelectedPairingId(e.target.value)}
              required
            >
              <option value="" disabled>{t('placeholder.pairing')}</option>
              {user && pairings.map(p => (
                <option key={p.id} value={p.id}>
                  {user.id === p.mentor_id ? p.mentee.full_name : p.mentor.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('label.title')}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('placeholder.title')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('label.description')}</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t('placeholder.description')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('label.file')}</label>
            <input
              type="file"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleFileChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('label.type')}</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as ResourceType)}
            >
              <option value="document">{t('type.document')}</option>
              <option value="presentation">{t('type.presentation')}</option>
              <option value="image">{t('type.image')}</option>
              <option value="video">{t('type.video')}</option>
              <option value="code">{t('type.code')}</option>
              <option value="link">{t('type.link')}</option>
            </select>
          </div>
        </div>

        {(formError || fetchErrorKey) && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {formError || t(fetchErrorKey)}
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? t('cta.loading') : t('cta.submit')}
        </button>
      </form>
    </div>
  )
}
