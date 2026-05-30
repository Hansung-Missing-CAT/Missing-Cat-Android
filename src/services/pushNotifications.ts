// FCM 제외 — google-services.json 미포함으로 전체 비활성화
import type { PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications'

export type PushTokenCallback = (token: string) => void
export type PushMessageCallback = (notification: PushNotificationSchema) => void
export type PushActionCallback = (action: ActionPerformed) => void

// 푸시 알림 초기화 및 권한 요청
// FCM 제외 — google-services.json 미포함으로 비활성화
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function initPushNotifications(
  _onToken: PushTokenCallback,
  _onMessage: PushMessageCallback,
  _onAction: PushActionCallback,
): Promise<void> {}

// 리스너 전체 제거 (컴포넌트 언마운트 시)
// FCM 제외로 비활성화
export async function removePushListeners(): Promise<void> {}
