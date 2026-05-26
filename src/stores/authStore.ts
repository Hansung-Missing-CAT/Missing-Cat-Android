import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authService, type SignupRequest } from '@/services/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  // 동기 액션
  setAuth: (user: User, accessToken: string) => void
  clearAuth: () => void
  updateUser: (user: Partial<User>) => void
  // 비동기 액션
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupRequest) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken)
        set({ user, accessToken, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      // 로그인 — authService.login 호출 후 스토어에 반영
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { user, accessToken } = await authService.login({ email, password })
          get().setAuth(user, accessToken)
        } finally {
          set({ isLoading: false })
        }
      },

      // 회원가입 — 자동 로그인 없음
      signup: async (data) => {
        set({ isLoading: true })
        try {
          await authService.signup(data)
        } finally {
          set({ isLoading: false })
        }
      },

      // 로그아웃 — authService.logout이 localStorage를 클리어하므로 스토어만 초기화
      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
        } finally {
          get().clearAuth()
          set({ isLoading: false })
        }
      },

      // 앱 초기화 시 토큰이 있으면 내 정보를 서버에서 조회
      fetchMe: async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) return
        set({ isLoading: true })
        try {
          const user = await authService.getMe()
          set({ user, isAuthenticated: true })
        } catch {
          get().clearAuth()
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
)
