'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null
  return <>{children}</>
}
