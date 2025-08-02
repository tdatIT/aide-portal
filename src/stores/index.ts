import type { Language, ThemeMode, UserWithRoles } from '@/types'
import { defineStore } from 'pinia'

// Auth Store
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserWithRoles | null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: false
  }),

  getters: {
    currentUser: (state) => state.user,
    hasPermission: (state) => (permission: string) => {
      // Check if user has admin role or specific permission
      if (state.user?.roles?.some(role => role.name === 'ROLE_ADMIN')) {
        return true
      }
      return state.user?.roles?.some(role => role.name === permission) || false
    },
    hasRole: (state) => (role: string) => {
      return state.user?.roles?.some(roleObj => roleObj.name === role) || false
    },
    isAdmin: (state) => {
      return state.user?.roles?.some(role => role.name === 'ROLE_ADMIN') || false
    }
  },

  actions: {
    setUser(user: UserWithRoles | null) {
      localStorage.setItem('user', JSON.stringify(user))
      this.user = user
      this.isAuthenticated = !!user
    },

    // Handle auth response from new API format
    setAuthData(authData: { accessToken: string; refreshToken: string; user: UserWithRoles }) {
      localStorage.setItem('accessToken', authData.accessToken)
      localStorage.setItem('refreshToken', authData.refreshToken)
      this.setUser(authData.user)
    },
    
    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }
})

// App Store for global state
export const useAppStore = defineStore('app', {
  state: () => ({
    theme: (localStorage.getItem('theme') as ThemeMode) || 'light',
    language: (localStorage.getItem('language') as Language) || 'vi',
    collapsed: false, // Sidebar collapsed state
    loading: false
  }),

  actions: {
    setTheme(theme: ThemeMode) {
      this.theme = theme
      localStorage.setItem('theme', theme)
      // Update document class for theme
      document.documentElement.setAttribute('data-theme', theme)
    },

    setLanguage(language: Language) {
      this.language = language
      localStorage.setItem('language', language)
    },

    toggleSidebar() {
      this.collapsed = !this.collapsed
    },

    setCollapsed(collapsed: boolean) {
      this.collapsed = collapsed
    },

    setLoading(loading: boolean) {
      this.loading = loading
    }
  }
}) 