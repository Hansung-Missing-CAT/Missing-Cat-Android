import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '@/components/Input/Input'
import Button from '@/components/Button/Button'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/authStore'
import styles from './LoginPage.module.css'

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    let valid = true
    if (!email) {
      setEmailError('이메일을 입력해주세요')
      valid = false
    } else {
      setEmailError('')
    }
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요')
      valid = false
    } else {
      setPasswordError('')
    }
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setServerError('')
    try {
      const { user, accessToken } = await authService.login({ email, password })
      setAuth(user, accessToken)
      navigate('/', { replace: true })
    } catch {
      // API 미연동 시 목 사용자로 처리
      const mockUser = {
        id: 'mock-user-1',
        email: email,
        nickname: email.split('@')[0],
      }
      setAuth(mockUser, 'mock-token')
      navigate('/', { replace: true })
    } finally {
      setIsLoading(false)
    }
  }

  // Google 로그인 — Firebase Auth 연동 (Phase 7 네이티브 연동 시 완성)
  const handleGoogleLogin = () => {
    alert('Google 로그인은 Firebase 설정 후 활성화됩니다')
  }

  const EyeIcon = () => (
    <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="비밀번호 표시">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {showPassword ? (
          <>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </>
        ) : (
          <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    </button>
  )

  return (
    <div className={styles.container}>
      <div className={styles.logoSection}>
        <div className={styles.catIcon}>🐱</div>
        <span className={styles.appName}>Missing PET</span>
        <span className={styles.tagline}>AI 기반 분실 반려동물 매칭 서비스</span>
      </div>

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
        <div>
          <Input
            label="비밀번호"
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorMessage={passwordError}
            rightElement={<EyeIcon />}
            autoComplete="current-password"
          />
          <p className={styles.forgotPassword}>
            <Link to="/forgot-password">비밀번호를 잊으셨나요?</Link>
          </p>
        </div>

        {serverError && (
          <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
            {serverError}
          </p>
        )}

        <div className={styles.loginButton}>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </div>

        <div className={styles.divider}>또는</div>

        <button type="button" className={styles.googleButton} onClick={handleGoogleLogin}>
          <GoogleIcon />
          Google로 계속하기
        </button>
      </form>

      <p className={styles.registerLink}>
        계정이 없으신가요? <Link to="/register">회원가입</Link>
      </p>
    </div>
  )
}
