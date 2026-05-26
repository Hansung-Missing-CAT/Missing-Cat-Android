import { useNavigate } from 'react-router-dom'
import { useLocationStore } from '@/stores/locationStore'
import { useNotificationStore } from '@/stores/notificationStore'
import styles from './HomeHeader.module.css'

interface HomeHeaderProps {
  onDistrictClick: () => void
}

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
)

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

// 홈 화면 상단 바 (지역 선택 + 검색/알림/설정 버튼)
export default function HomeHeader({ onDistrictClick }: HomeHeaderProps) {
  const navigate = useNavigate()
  const { selectedDistrict } = useLocationStore()
  const { unreadCount } = useNotificationStore()

  return (
    <header className={styles.header}>
      {/* 좌상단: 지역 선택 버튼 */}
      <button className={styles.districtButton} onClick={onDistrictClick}>
        <span className={styles.districtText}>{selectedDistrict}</span>
        <ChevronDownIcon />
      </button>

      {/* 우상단: 검색, 알림, 설정 */}
      <div className={styles.actions}>
        <button
          className={styles.iconButton}
          onClick={() => navigate('/search')}
          aria-label="검색"
        >
          <SearchIcon />
        </button>
        <button
          className={styles.iconButton}
          onClick={() => navigate('/notifications')}
          aria-label="알림"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
        <button
          className={styles.iconButton}
          onClick={() => navigate('/settings')}
          aria-label="설정"
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  )
}
