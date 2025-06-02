import api from '@/services/api' // Assuming your api service is here
import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  username: string
}

interface FieldError {
  message: string
  path: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  error: string | null
  fieldErrors: Record<string, string> | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    error: null,
    fieldErrors: null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.token && !!state.user,
  },
  actions: {
    async login(credentials: { emailOrUsername: string; password: string }) {
      this.loading = true
      this.error = null
      this.fieldErrors = null

      try {
        const response = await api.post<{ token: string; user: User }>('/api/auth/login', {
          login: credentials.emailOrUsername, // Changed 'email' to 'login'
          password: credentials.password,
        })

        const { token, user } = response.data
        this.token = token
        this.user = user

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      } catch (err: any) {
        this.token = null
        this.user = null

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        if (err.response && err.response.data) {
          this.error = err.response.data.message || 'Login failed.'

          if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
            const fieldErrorsData: Record<string, string> = {}

            err.response.data.errors.forEach((fieldError: FieldError) => {
              if (fieldError.path && fieldError.path.length > 0) {
                fieldErrorsData[fieldError.path[0]] = fieldError.message
              }
            })

            this.fieldErrors = fieldErrorsData
          }
        } else {
          this.error = err.message || 'Login failed. Please try again.'
        }

        throw err
      } finally {
        this.loading = false
      }
    },

    async register(payload: { username: string; email: string; password: string }) {
      this.loading = true
      this.error = null
      this.fieldErrors = null

      try {
        const response = await api.post<{ token: string; user: User }>('/api/auth/register', {
          username: payload.username,
          email: payload.email,
          password: payload.password,
        })

        const { token, user } = response.data
        this.setAuthData(user, token)
      } catch (err: any) {
        this.token = null
        this.user = null

        localStorage.removeItem('token')

        if (err.response && err.response.data) {
          this.error = err.response.data.message || 'Registration failed.'

          if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
            const fieldErrorsData: Record<string, string> = {}

            err.response.data.errors.forEach((fieldError: FieldError) => {
              if (fieldError.path && fieldError.path.length > 0)
                fieldErrorsData[fieldError.path[0]] = fieldError.message
            })

            this.fieldErrors = fieldErrorsData
          }
        } else {
          this.error = err.message || 'Registration failed. Please try again.'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.error = null
      this.fieldErrors = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    checkAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        // we might want to validate the token with a backend endpoint
        // for now, we'll assume if a token exists, it's valid.
        // and potentially fetch user details if not stored or to refresh them.
        // this is a simplified checkAuth.
        this.token = token
      } else {
        this.user = null
        this.token = null
      }
    },

    setAuthData(user: User, token: string) {
      this.user = user
      this.token = token

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      this.error = null
      this.fieldErrors = null
    },

    clearError() {
      this.error = null
      this.fieldErrors = null
    },
  },
})
