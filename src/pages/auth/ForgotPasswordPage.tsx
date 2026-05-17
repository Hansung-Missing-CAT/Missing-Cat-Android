import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '@/components/Input/Input'
import Button from '@/components/Button/Button'
import { authService } from '@/services/auth'
import styles from './ForgotPasswordPage.module.css'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요')
      return
    }
    setEmailError('')
    setIsLoading(true)
    try {
      await authService.sendResetEmail(email)
      setIsSent(true)
    } catch {
      // 보안상 이메일 존재 여부와 관계없이 성공으로 표시
      setIsSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
      </div>

      <h1 className={styles.title}>비밀번호 찾기</h1>
      <p className={styles.description}>
        가입 시 사용한 이메일 주소를 입력하면{'\n'}비밀번호 재설정 링크를 보내드립니다.
      </p>

      {isSent ? (
        <div className={styles.successBox}>
          <div className={styles.successIcon}>📧</div>
          <h2 className={styles.successTitle}>이메일을 확인해주세요</h2>
          <p className={styles.successMessage}>
            {email}으로{'\n'}비밀번호 재설정 링크를 발송했습니다.{'\n'}
            이메일이 오지 않으면 스팸함을 확인해주세요.
          </p>
          <Button
            variant="outline"
            style={{ marginTop: 'var(--spacing-5)' }}
            onClick={() => navigate('/login')}
          >
            로그인으로 돌아가기
          </Button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            label="이메일"
            type="email"
            placeholder="이메일을 입력해주세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            errorMessage={emailError}
            autoComplete="email"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '발송 중...' : '재설정 링크 보내기'}
          </Button>
        </form>
      )}
    </div>
  )
}
