import { NavLink } from 'react-router-dom'
import styles from './NavBar.module.css'

interface IconProps {
  filled: boolean
}

// 하단 네비게이션 탭 아이콘 (SVG 인라인)
const HomeIcon = ({ filled }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
    />
  </svg>
)

// 실종신고 탭은 항상 흰색 아이콘 (빨간 원형 버튼 내부)
const ReportIcon = (_: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
)

const TipOffIcon = ({ filled }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M9.5 6.5v3h-3v2h3v3h2v-3h3v-2h-3v-3h-2zM11 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-10-4z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
    />
  </svg>
)

const ChatIcon = ({ filled }: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
    />
  </svg>
)

interface TabConfig {
  to: string
  label: string
  Icon: React.ComponentType<IconProps>
  isReport?: boolean
}

const tabs: TabConfig[] = [
  { to: '/', label: '홈', Icon: HomeIcon },
  { to: '/report', label: '실종신고', Icon: ReportIcon, isReport: true },
  { to: '/tipoff', label: '제보', Icon: TipOffIcon },
  { to: '/chat', label: '채팅', Icon: ChatIcon },
]

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      {tabs.map(({ to, label, Icon, isReport }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `${styles.navItem}${isActive ? ` ${styles.active}` : ''}`
          }
        >
          {({ isActive }) => (
            <>
              <div className={styles.iconWrapper}>
                {isReport ? (
                  <div className={styles.reportButton}>
                    <Icon filled={isActive} />
                  </div>
                ) : (
                  <Icon filled={isActive} />
                )}
              </div>
              {!isReport && label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
