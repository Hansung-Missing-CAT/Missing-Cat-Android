import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import styles from './OfflineBanner.module.css'

// 오프라인 상태 시 상단 배너 표시
export default function OfflineBanner() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <span className={styles.icon}>📡</span>
      <span className={styles.message}>오프라인 상태입니다. 일부 기능이 제한될 수 있어요.</span>
    </div>
  )
}
