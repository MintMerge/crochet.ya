import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar'
import { AdminTopbar } from '@/components/admin/layout/admin-topbar'

export const metadata: Metadata = {
  title: {
    default: 'Admin | Crochet Ya',
    template: '%s | Admin',
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
