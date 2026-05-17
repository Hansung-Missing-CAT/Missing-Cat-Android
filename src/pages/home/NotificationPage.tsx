import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '@/stores/notificationStore'
import type { NotificationType } from '@/types'
import styles from './NotificationPage.module.css'

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

// 알림 타입별 아이콘
const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  matching: '🤖',
  comment: '💬',
  tipoff: '📸',
  nearby: '📍',
}

// 알림 타입별 색상
const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  matching: '#D32F2F',
  comment: '#1976D2',
  tipoff: '#388E3C',
  nearby: '#F57C00',
}

// 경과 시간 계산
function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor(diff / 60000)
  if (days > 0) return `${days}일 전`
  if (hours > 0) return `${hours}시간 전`
  if (minutes > 0) return `${minutes}분 전`
  return '방금 전'
}

// 알림 목록 페이지 (NavBar 없음)
export default function NotificationPage() {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore()
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleNotificationClick = (id: string, relatedPostId?: string) => {
    markAsRead(id)
    if (relatedPostId) {
      navigate(`/post/${relatedPostId}`)
    }
  }

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <BackIcon />
        </button>
        <h1 className={styles.title}>알림</h1>
        {unreadCount > 0 && (
          <button className={styles.readAllBtn} onClick={markAllAsRead}>
            모두 읽음
          </button>
        )}
      </header>

      {/* 알림 목록 */}
      <main className={styles.main}>
        {notifications.length > 0 ? (
          <ul className={styles.list}>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
                onClick={() => handleNotificationClick(notification.id, notification.relatedPostId)}
              >
                {/* 아이콘 */}
                <div
                  className={styles.iconWrapper}
                  style={{ backgroundColor: `${NOTIFICATION_COLORS[notification.type]}20` }}
                >
                  <span className={styles.icon}>{NOTIFICATION_ICONS[notification.type]}</span>
                </div>

                {/* 내용 */}
                <div className={styles.content}>
                  <p className={styles.notifTitle}>{notification.title}</p>
                  <p className={styles.message}>{notification.message}</p>
                  <span className={styles.time}>{getTimeAgo(notification.createdAt)}</span>
                </div>

                {/* 안읽음 점 */}
                {!notification.isRead && <div className={styles.unreadDot} />}
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔔</span>
            <p className={styles.emptyTitle}>새로운 알림이 없어요</p>
            <p className={styles.emptyDesc}>제보나 댓글이 달리면 알려드릴게요</p>
          </div>
        )}
      </main>
    </div>
  )
}
