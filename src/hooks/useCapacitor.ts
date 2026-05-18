import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { initPushNotifications, removePushListeners } from '@/services/pushNotifications'
import { registerDeepLinkListener, removeDeepLinkListener } from '@/services/deeplink'
import { useNotificationStore } from '@/stores/notificationStore'

// 앱 시작 시 Capacitor 플러그인 초기화 (푸시 알림, 딥링크)
export function useCapacitor(): void {
  const navigate = useNavigate()
  const addNotification = useNotificationStore((s) => s.addNotification)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    // 푸시 알림 초기화
    initPushNotifications(
      (token) => {
        // FCM 토큰 → 서버로 전송 (API 연동 시 구현)
        console.log('FCM Token:', token)
      },
      (notification) => {
        // 포그라운드 알림 수신 → 알림 스토어에 추가
        addNotification({
          id: Date.now().toString(),
          type: 'matching',
          title: notification.title ?? '새 알림',
          message: notification.body ?? '',
          isRead: false,
          createdAt: new Date().toISOString(),
        })
      },
      (action) => {
        // 알림 탭 → 딥링크 처리
        const data = action.notification.data as Record<string, string> | undefined
        const path = data?.path
        if (path) navigate(path)
      },
    )

    // 딥링크 리스너 등록
    registerDeepLinkListener((path) => navigate(path))

    return () => {
      removePushListeners()
      removeDeepLinkListener()
    }
  }, [navigate, addNotification])
}
