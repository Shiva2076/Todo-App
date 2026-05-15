'use client'

import { useAppSelector, useAppDispatch } from '@/store'
import { clearCredentials, setCredentials } from '@/store/slices/authSlice'
import { useLogoutMutation } from '@/services/api'
import { useRouter } from 'next/navigation'
import { AuthResponse } from '@/types'

export function useAuth() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user, accessToken, isAuthenticated } = useAppSelector((state) => state.auth)
  const [logoutMutation] = useLogoutMutation()

  const login = (data: AuthResponse) => {
    dispatch(setCredentials({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }))
    router.push('/dashboard')
  }

  const logout = async () => {
    try {
      await logoutMutation()
    } catch {
      // ignore errors
    } finally {
      dispatch(clearCredentials())
      router.push('/login')
    }
  }

  return { user, accessToken, isAuthenticated, login, logout }
}
