import apiClient from './api'
import type { Notification, NotificationType } from '@/types'

// 백엔드 알림 응답 타입 (snake_case)
interface BackendNotification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  related_pet_id?: string
  related_chat_id?: string
  created_at: string
}

// 백엔드 알림 타입 → 프론트 NotificationType 변환
const toFrontendNotificationType = (backendType: string): NotificationType => {
  switch (backendType) {
    case 'comment': return 'comment'
    case 'tip_match': return 'matching'
    case 'nearby': return 'nearby'
    case 'like':
    case 'chat':
    default:
      return 'tipoff'
  }
}

// 백엔드 알림 → 프론트 Notification 변환
const toFrontendNotification = (b: BackendNotification): Notification => ({
  id: b.id,
  type: toFrontendNotificationType(b.type),
  title: b.title,
  message: b.message,
  isRead: b.is_read,
  relatedPostId: b.related_pet_id,
  relatedChatId: b.related_chat_id,
  createdAt: b.created_at,
})

export const notificationsService = {
  // 알림 목록 조회
  getNotifications: async (): Promise<Notification[]> => {
    const res = await apiClient.get<BackendNotification[]>('/notifications')
    return res.data.map(toFrontendNotification)
  },

  // 미읽음 알림 수 조회
  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<{ count: number }>('/notifications/unread-count')
    return res.data.count
  },

  // 단건 읽음 처리
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`)
  },

  // 전체 읽음 처리
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all')
  },
}
