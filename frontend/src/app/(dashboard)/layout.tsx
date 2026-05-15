'use client'

import Sidebar from '@/components/layout/Sidebar'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
