import apiClient from './api'

// 디바이스 등록 응답 타입
interface DeviceRegistration {
  id: string
  user_id: string
  token: string
  platform: string
  created_at: string
}

// 디바이스 토큰 ID를 로컬에 저장하는 키
const DEVICE_TOKEN_ID_KEY = 'deviceTokenId'

export const devicesService = {
  // FCM 토큰을 서버에 등록하고 tokenId를 localStorage에 저장
  registerDevice: async (token: string, platform: 'android' | 'ios' | 'web'): Promise<void> => {
    const res = await apiClient.post<DeviceRegistration>('/devices/register', { token, platform })
    localStorage.setItem(DEVICE_TOKEN_ID_KEY, res.data.id)
  },

  // 로그아웃 시 등록된 디바이스 토큰 삭제
  removeDevice: async (): Promise<void> => {
    const tokenId = localStorage.getItem(DEVICE_TOKEN_ID_KEY)
    if (!tokenId) return
    await apiClient.delete(`/devices/${tokenId}`)
    localStorage.removeItem(DEVICE_TOKEN_ID_KEY)
  },
}
