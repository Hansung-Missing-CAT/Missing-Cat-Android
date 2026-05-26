import apiClient from './api'
import type { User } from '@/types'

// 백엔드 사용자 응답 타입 (snake_case)
interface BackendUser {
  id: string
  email: string
  name: string
  phone?: string
  avatar_url?: string
  is_online?: boolean
  last_seen_at?: string
  agree_marketing?: boolean
  created_at?: string
}

// 프로필 수정 요청 타입
export interface UpdateMeRequest {
  nickname?: string
  phone?: string
  profileImage?: string
}

// 백엔드 snake_case → 프론트 camelCase 변환
const toFrontendUser = (b: BackendUser): User => ({
  id: b.id,
  email: b.email,
  nickname: b.name,
  profileImage: b.avatar_url,
  phone: b.phone,
})

export const usersService = {
  // 내 정보 조회
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<BackendUser>('/users/me')
    return toFrontendUser(res.data)
  },

  // 프로필 수정 — camelCase → snake_case 변환 후 전송
  updateMe: async (data: UpdateMeRequest): Promise<User> => {
    const payload: Record<string, string | undefined> = {}
    if (data.nickname !== undefined) payload.name = data.nickname
    if (data.phone !== undefined) payload.phone = data.phone
    if (data.profileImage !== undefined) payload.avatar_url = data.profileImage
    const res = await apiClient.patch<BackendUser>('/users/me', payload)
    return toFrontendUser(res.data)
  },
}
