import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header'
import { SettingsForm } from '@/components/admin/settings/settings-form'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Configure your shop details"
      />
      <SettingsForm />
    </div>
  )
}
