import { TranslationsManager } from '@/components/admin/TranslationsManager'

export default function TranslationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Translations</h1>
          <p className="text-gray-600">Manage localized strings for each namespace and language.</p>
        </div>
        <TranslationsManager />
      </div>
    </div>
  )
}
