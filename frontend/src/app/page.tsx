'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store'

export default function Home() {
  const router = useRouter()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    router.replace(isAuthenticated ? '/dashboard' : '/login')
  }, [isAuthenticated, router])

  return null
}
