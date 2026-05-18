import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './NotificationSettingsPage.module.css'

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

interface NotifSetting {
  key: string
  label: string
  description: string
  enabled: boolean
}

const INITIAL_SETTINGS: NotifSetting[] = [
  { key: 'all',     label: '전체 알림',    description: '모든 푸시 알림 수신',                  enabled: true  },
  { key: 'matching',label: '매칭 알림',    description: 'AI 유사도 매칭 결과 알림',              enabled: true  },
  { key: 'tipoff',  label: '제보 알림',    description: '내 게시글에 제보가 들어왔을 때',        enabled: true  },
  { key: 'comment', label: '댓글 알림',    description: '내 게시글에 댓글이 달렸을 때',          enabled: true  },
  { key: 'nearby',  label: '근처 발견 알림',description: '설정한 반경 내 유사 동물 발견 시',    enabled: false },
  { key: 'chat',    label: '채팅 알림',    description: '새 채팅 메시지 수신 시',                enabled: true  },
]

export default function NotificationSettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<NotifSetting[]>(INITIAL_SETTINGS)

  // 알림 항목 토글 (No.89)
  const toggle = (key: string) => {
    if (key === 'all') {
      // 전체 알림 토글 → 모든 항목 일괄 변경
      const allEnabled = settings.find((s) => s.key === 'all')?.enabled ?? true
      setSettings((prev) => prev.map((s) => ({ ...s, enabled: !allEnabled })))
      return
    }
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s))
    )
    // TODO: 알림 설정 API 연동
  }

  const allEnabled = settings.find((s) => s.key === 'all')?.enabled ?? true

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <BackIcon />
        </button>
        <h1 className={styles.title}>알림 설정</h1>
        <span />
      </header>

      <ul className={styles.list}>
        {settings.map((s) => (
          <li key={s.key} className={[styles.item, s.key === 'all' ? styles.allItem : ''].join(' ')}>
            <div className={styles.itemText}>
              <span className={styles.itemLabel}>{s.label}</span>
              <span className={styles.itemDesc}>{s.description}</span>
            </div>
            <button
              role="switch"
              aria-checked={s.enabled}
              className={[styles.toggle, s.enabled ? styles.on : ''].join(' ')}
              onClick={() => toggle(s.key)}
              disabled={s.key !== 'all' && !allEnabled}
            >
              <span className={styles.thumb} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
