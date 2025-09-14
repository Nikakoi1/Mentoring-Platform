import { UserManagementTable } from '@/components/admin/UserManagementTable'

export default function ManageUsersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <UserManagementTable />
    </div>
  )
}
