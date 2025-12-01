'use client'

import { use } from 'react'

import { UserProfile } from '@/components/profile/UserProfile'

type ProfilePageParams = Promise<{ userId: string }>

export default function UserProfilePage({ params }: { params: ProfilePageParams }) {
  const { userId } = use(params)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <UserProfile userId={userId} />
    </div>
  )
}
