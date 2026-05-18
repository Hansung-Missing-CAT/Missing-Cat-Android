import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal, { ModalActions } from '@/components/Modal/Modal'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth'
import styles from './SettingsPage.module.css'

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" />
  </svg>
)

interface MenuItem {
  label: string
  path?: string
  onClick?: () => void
  danger?: boolean
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuth()
  const [logoutModal, setLogoutModal] = useState(false)
  const [withdrawModal, setWithdrawModal] = useState(false)

  const initial = user?.nickname?.slice(0, 1) ?? '?'

  // 로그아웃 처리 (No.90)
  const handleLogout = async () => {
    try { await authService.logout() } catch { /* 서버 오류 무시 */ }
    clearAuth()
    navigate('/login', { replace: true })
  }

  // 회원 탈퇴 처리 (No.91)
  const handleWithdraw = async () => {
    // TODO: 탈퇴 API 연동
    clearAuth()
    navigate('/login', { replace: true })
  }

  const menuSections: Array<{ title?: string; items: MenuItem[] }> = [
    {
      title: '계정',
      items: [
        { label: '프로필 수정', path: '/profile' },
        { label: '내 게시글 관리', path: '/my-posts' },
      ],
    },
    {
      title: '알림',
      items: [
        { label: '알림 설정', path: '/notification-settings' },
      ],
    },
    {
      items: [
        { label: '로그아웃', onClick: () => setLogoutModal(true) },
        { label: '회원 탈퇴', onClick: () => setWithdrawModal(true), danger: true },
      ],
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>설정</h1>
      </header>

      {/* 프로필 요약 카드 (No.86) */}
      <button className={styles.profileCard} onClick={() => navigate('/profile')}>
        <div className={styles.avatar}>
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.nickname} className={styles.avatarImg} />
          ) : (
            <span className={styles.avatarInitial}>{initial}</span>
          )}
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.nickname}>{user?.nickname ?? '사용자'}</span>
          <span className={styles.email}>{user?.email ?? ''}</span>
        </div>
        <ChevronIcon />
      </button>

      {/* 설정 메뉴 섹션 */}
      <div className={styles.sections}>
        {menuSections.map((section, si) => (
          <div key={si} className={styles.section}>
            {section.title && (
              <span className={styles.sectionTitle}>{section.title}</span>
            )}
            <ul className={styles.menuList}>
              {section.items.map((item) => (
                <li key={item.label}>
                  <button
                    className={[styles.menuItem, item.danger ? styles.danger : ''].join(' ')}
                    onClick={item.path ? () => navigate(item.path!) : item.onClick}
                  >
                    <span>{item.label}</span>
                    {item.path && <ChevronIcon />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 로그아웃 확인 모달 (No.90) */}
      <Modal isOpen={logoutModal} onClose={() => setLogoutModal(false)} title="로그아웃">
        <p className={styles.modalMsg}>정말 로그아웃 하시겠습니까?</p>
        <ModalActions>
          <button className={styles.cancelBtn} onClick={() => setLogoutModal(false)}>취소</button>
          <button className={styles.confirmBtn} onClick={handleLogout}>로그아웃</button>
        </ModalActions>
      </Modal>

      {/* 회원 탈퇴 확인 모달 (No.91) */}
      <Modal isOpen={withdrawModal} onClose={() => setWithdrawModal(false)} title="회원 탈퇴">
        <p className={styles.modalMsg}>
          탈퇴 시 모든 데이터가 삭제되며<br />복구할 수 없습니다.
        </p>
        <ModalActions>
          <button className={styles.cancelBtn} onClick={() => setWithdrawModal(false)}>취소</button>
          <button className={[styles.confirmBtn, styles.dangerBtn].join(' ')} onClick={handleWithdraw}>
            탈퇴하기
          </button>
        </ModalActions>
      </Modal>
    </div>
  )
}
