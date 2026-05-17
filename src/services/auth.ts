import apiClient from './api'
import type { User, ApiResponse } from '@/types'

interface LoginRequest {
  email: string
  password: string
}

interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export const authService = {
  // 이메일 로그인
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),

  // 회원가입
  register: (data: LoginRequest & { nickname: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  // 로그아웃
  logout: () => apiClient.post('/auth/logout'),

  // 내 정보 조회
  getMe: () => apiClient.get<ApiResponse<User>>('/auth/me'),

  // 비밀번호 재설정 이메일 발송
  sendResetEmail: (email: string) =>
    apiClient.post('/auth/password-reset', { email }),
}
