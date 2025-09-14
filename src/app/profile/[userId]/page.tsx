'use client'

import { UserProfile } from '@/components/profile/UserProfile'

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <UserProfile userId={params.userId} />
    </div>
  )
}
