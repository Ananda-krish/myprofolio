import { create } from 'zustand'
import api from '../api/apiConfig'

const useAuthStore = create((set) => ({
  admin: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/api/v1/auth/login', { email, password })
      localStorage.setItem('auth_token', data.token)
      set({ admin: data.admin, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      set({ isLoading: false })
      const message =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'ACCESS DENIED — check credentials'
      return { success: false, message }
    }
  },

  logout: async () => {
    try {
      await api.post('/api/v1/auth/logout')
    } finally {
      localStorage.removeItem('auth_token')
      set({ admin: null, isAuthenticated: false })
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      set({ admin: null, isAuthenticated: false, isLoading: false })
      return
    }
    set({ isLoading: true })
    try {
      const { data } = await api.get('/api/v1/auth/me')
      set({ admin: data, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('auth_token')
      set({ admin: null, isAuthenticated: false, isLoading: false })
    }
  },
}))

export default useAuthStore
