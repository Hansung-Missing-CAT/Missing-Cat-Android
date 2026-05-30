import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
// FCM 제외 — google-services.json 미포함으로 비활성화
// import { initPushNotifications, removePushListeners } from '@/services/pushNotifications'
import { registerDeepLinkListener, removeDeepLinkListener } from '@/services/deeplink'

// 앱 시작 시 Capacitor 플러그인 초기화 (딥링크)
export function useCapacitor(): void {
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    // 딥링크 리스너 등록
    registerDeepLinkListener((path) => navigate(path))

    return () => {
      // removePushListeners()
      removeDeepLinkListener()
    }
  }, [navigate])
}
