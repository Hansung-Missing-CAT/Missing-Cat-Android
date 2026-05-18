import {
  PushNotifications,
  PushNotificationSchema,
  ActionPerformed,
  Token,
} from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

export type PushTokenCallback = (token: string) => void
export type PushMessageCallback = (notification: PushNotificationSchema) => void
export type PushActionCallback = (action: ActionPerformed) => void

// 푸시 알림 초기화 및 권한 요청
export async function initPushNotifications(
  onToken: PushTokenCallback,
  onMessage: PushMessageCallback,
  onAction: PushActionCallback,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') return

  await PushNotifications.register()

  // FCM 토큰 수신 — 서버에 전송해 특정 기기에 알림 발송 가능
  PushNotifications.addListener('registration', (token: Token) => {
    onToken(token.value)
  })

  // 앱 포그라운드 상태에서 알림 수신
  PushNotifications.addListener(
    'pushNotificationReceived',
    (notification: PushNotificationSchema) => {
      onMessage(notification)
    },
  )

  // 알림 탭 → 딥링크 처리
  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (action: ActionPerformed) => {
      onAction(action)
    },
  )
}

// 리스너 전체 제거 (컴포넌트 언마운트 시)
export async function removePushListeners(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  await PushNotifications.removeAllListeners()
}
