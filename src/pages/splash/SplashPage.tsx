import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import styles from './SplashPage.module.css'

// 앱 실행 시 1.5초 표시 후 인증 상태에 따라 분기
export default function SplashPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [isAuthenticated, navigate])

  return (
    <div className={styles.container}>
      <div className={styles.catIcon}>🐱</div>
      <div className={styles.logo}>
        <span className={styles.appName}>Missing PET</span>
        <span className={styles.tagline}>AI 기반 분실 반려동물 매칭 서비스</span>
      </div>
    </div>
  )
}
