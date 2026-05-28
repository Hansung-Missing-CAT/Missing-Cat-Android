import apiClient from './api'
import type { User } from '@/types'

// 로그인 요청 타입
interface LoginRequest {
  email: string
  password: string
}

// 회원가입 요청 타입 (백엔드 필드명 기준)
export interface SignupRequest {
  email: string
  password: string
  name: string
  phone?: string
  agreeTerms: boolean
  agreePrivacy: boolean
  agreeMarketing?: boolean
}

// 백엔드 응답 사용자 타입 (snake_case)
interface BackendUser {
  id: string
  email: string
  name: string
  phone?: string
  avatar_url?: string
  agree_marketing?: boolean
  is_online?: boolean
  last_seen_at?: string
  created_at?: string
}

// 로그인 응답 타입
interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: BackendUser
}

// 회원가입 응답 타입
interface SignupResponse {
  user: BackendUser
}

// 백엔드 snake_case → 프론트 camelCase 변환
const toFrontendUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  email: backendUser.email,
  nickname: backendUser.name,
  profileImage: backendUser.avatar_url,
  phone: backendUser.phone,
})

export const authService = {
  // 이메일 로그인 — 토큰을 localStorage에 저장 후 변환된 사용자 반환
  login: async (data: LoginRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', data)
    const { accessToken, refreshToken, user } = res.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    return { user: toFrontendUser(user), accessToken, refreshToken }
  },

  // 회원가입 — 자동 로그인 없음, 변환된 사용자 반환
  signup: async (data: SignupRequest): Promise<User> => {
    const res = await apiClient.post<SignupResponse>('/auth/signup', data)
    return toFrontendUser(res.data.user)
  },

  // 로그아웃 — 성공/실패 무관하게 localStorage 토큰 클리어
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  },

  // 내 정보 조회 (/users/me)
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<BackendUser>('/users/me')
    return toFrontendUser(res.data)
  },

  // Google 로그인 — GIS에서 받은 idToken을 백엔드로 전달
  googleLogin: async (idToken: string, nonce?: string): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
    const res = await apiClient.post<LoginResponse>('/auth/login/google', { idToken, nonce })
    const { accessToken, refreshToken, user } = res.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    return { user: toFrontendUser(user), accessToken, refreshToken }
  },

  // 비밀번호 재설정 이메일 발송
  sendResetEmail: async (email: string): Promise<void> => {
    await apiClient.post('/auth/password/forgot', { email })
  },
}
