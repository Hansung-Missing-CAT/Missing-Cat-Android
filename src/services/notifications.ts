import apiClient from './api'
import type { Notification, NotificationType } from '@/types'

// 페이지네이션 래핑 응답 타입 (배열 또는 { data, nextCursor, hasMore })
interface PaginatedNotificationResponse {
  data: BackendNotification[]
  nextCursor?: string
  hasMore?: boolean
}

// 배열 또는 래핑 응답에서 BackendNotification[] 추출
const extractNotifications = (
  raw: BackendNotification[] | PaginatedNotificationResponse,
): BackendNotification[] => {
  if (Array.isArray(raw)) return raw
  return raw.data ?? []
}

// 백엔드 알림 응답 타입 — DB 실제 컬럼명 기준
interface BackendNotification {
  id: string
  type: string
  message: string         // DB 컬럼명: message (title 없음)
  read: boolean           // DB 컬럼명: read (is_read 아님)
  pet_id?: string         // DB 컬럼명: pet_id (related_pet_id 아님)
  related_chat_id?: string
  created_at: string
}

// 백엔드 알림 타입 → 프론트 NotificationType 변환
// DB CHECK: 'comment','like','tip','found','nearby_report'
const toFrontendNotificationType = (backendType: string): NotificationType => {
  switch (backendType) {
    case 'comment': return 'comment'
    case 'like': return 'like'
    case 'tip': return 'tip'
    case 'found': return 'found'
    case 'nearby_report': return 'nearby_report'
    // 구버전 타입 fallback
    case 'tip_match': return 'matching'
    case 'nearby': return 'nearby'
    default: return 'tipoff'
  }
}

// 백엔드 알림 → 프론트 Notification 변환
const toFrontendNotification = (b: BackendNotification): Notification => ({
  id: b.id,
  type: toFrontendNotificationType(b.type),
  title: b.message,        // DB에 title 없음 — message를 title로 표시
  message: b.message,
  isRead: b.read,          // DB 컬럼명: read
  relatedPostId: b.pet_id, // DB 컬럼명: pet_id
  relatedChatId: b.related_chat_id,
  createdAt: b.created_at,
})

export const notificationsService = {
  // 알림 목록 조회 — 배열 또는 { data, nextCursor, hasMore } 래핑 응답 모두 처리
  getNotifications: async (): Promise<Notification[]> => {
    const res = await apiClient.get<BackendNotification[] | PaginatedNotificationResponse>('/notifications')
    return extractNotifications(res.data).map(toFrontendNotification)
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
