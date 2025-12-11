import { CreatePairingForm } from '@/components/admin/CreatePairingForm'
import { ExistingPairingsList } from '@/components/admin/ExistingPairingsList'

export default function CreatePairingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <CreatePairingForm />
        <ExistingPairingsList />
      </div>
    </div>
  )
}
