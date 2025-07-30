import { defineStore } from 'pinia'
import type { User, LegacyUser, ThemeMode, Language } from '@/types'

// Auth Store
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('auth_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    isAuthenticated: false
  }),

  getters: {
    currentUser: (state) => state.user,
    hasPermission: (state) => (permission: string) => {
      // Check if user has admin role or specific permission
      if (state.user?.roles?.includes('ROLE_ADMIN')) {
        return true
      }
      return state.user?.roles?.includes(permission) || false
    },
    hasRole: (state) => (role: string) => {
      return state.user?.roles?.includes(role) || false
    },
    isAdmin: (state) => {
      return state.user?.roles?.includes('ROLE_ADMIN') || false
    }
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
      this.isAuthenticated = !!user
    },

    setToken(token: string | null) {
      this.token = token
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    },

    setRefreshToken(refreshToken: string | null) {
      this.refreshToken = refreshToken
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      } else {
        localStorage.removeItem('refresh_token')
      }
    },

    // Handle auth response from new API format
    setAuthData(authData: { accessToken: string; refreshToken: string; user: User }) {
      this.setToken(authData.accessToken)
      this.setRefreshToken(authData.refreshToken)
      this.setUser(authData.user)
    },

    // Legacy method for backward compatibility
    setLegacyUser(user: LegacyUser | null) {
      if (user) {
        // Convert legacy user to new format
        const newUser: User = {
          userId: user.id,
          username: user.email,
          fullName: user.name,
          email: user.email,
          roles: user.role?.permissions || [],
          avatar: user.avatar,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
        this.setUser(newUser)
      } else {
        this.setUser(null)
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isAuthenticated = false
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
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