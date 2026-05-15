'use client'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null, refreshToken: null, isAuthenticated: false }
  }
  try {
    const token = localStorage.getItem('accessToken')
    const user = localStorage.getItem('user')
    return {
      user: user ? JSON.parse(user) : null,
      accessToken: token,
      refreshToken: localStorage.getItem('refreshToken'),
      isAuthenticated: !!token,
    }
  } catch {
    return { user: null, accessToken: null, refreshToken: null, isAuthenticated: false }
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload.accessToken)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      }
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload)
      }
    },
    clearCredentials(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload))
      }
    },
  },
})

export const { setCredentials, setAccessToken, clearCredentials, updateUser } = authSlice.actions
export default authSlice.reducer
