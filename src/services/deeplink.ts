import { App, URLOpenListenerEvent } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

export type DeepLinkHandler = (path: string) => void

// 앱링크/딥링크 리스너 등록 — 알림 터치 시 특정 화면으로 이동
// 예: missingpet://post/123 → /post/123
export function registerDeepLinkListener(navigate: DeepLinkHandler): void {
  if (!Capacitor.isNativePlatform()) return

  App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
    const url = new URL(event.url)
    // custom scheme: missingpet://  또는 app link: https://missingpet.hansung.ac.kr/
    const path = url.pathname || url.host + url.pathname
    if (path) navigate(path)
  })
}

// 리스너 제거 (앱 종료 시)
export async function removeDeepLinkListener(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  await App.removeAllListeners()
}
