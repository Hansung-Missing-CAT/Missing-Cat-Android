import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '@/components/Input/Input'
import Button from '@/components/Button/Button'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/authStore'
import styles from './RegisterPage.module.css'

interface FormState {
  email: string
  nickname: string
  password: string
  passwordConfirm: string
}

interface FormErrors {
  email?: string
  nickname?: string
  password?: string
  passwordConfirm?: string
}

// 이메일 형식 검사
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

// 비밀번호 조건: 8자 이상, 영문+숫자 포함
const isValidPassword = (v: string) => v.length >= 8 && /[a-zA-Z]/.test(v) && /[0-9]/.test(v)

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState<FormState>({
    email: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))

    // 실시간 유효성 검사
    setErrors((prev) => {
      const next = { ...prev }
      switch (field) {
        case 'email':
          next.email = isValidEmail(value) ? undefined : '올바른 이메일 형식을 입력해주세요'
          break
        case 'nickname':
          next.nickname = value.trim().length >= 2 ? undefined : '닉네임은 2자 이상이어야 합니다'
          break
        case 'password':
          next.password = isValidPassword(value)
            ? undefined
            : '8자 이상, 영문과 숫자를 포함해야 합니다'
          if (form.passwordConfirm) {
            next.passwordConfirm =
              value === form.passwordConfirm ? undefined : '비밀번호가 일치하지 않습니다'
          }
          break
        case 'passwordConfirm':
          next.passwordConfirm =
            value === form.password ? undefined : '비밀번호가 일치하지 않습니다'
          break
      }
      return next
    })
  }

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!isValidEmail(form.email)) next.email = '올바른 이메일 형식을 입력해주세요'
    if (form.nickname.trim().length < 2) next.nickname = '닉네임은 2자 이상이어야 합니다'
    if (!isValidPassword(form.password)) next.password = '8자 이상, 영문과 숫자를 포함해야 합니다'
    if (form.password !== form.passwordConfirm) next.passwordConfirm = '비밀번호가 일치하지 않습니다'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setServerError('')
    try {
      const res = await authService.register({
        email: form.email,
        password: form.password,
        nickname: form.nickname,
      })
      const { user, accessToken } = res.data.data
      setAuth(user, accessToken)
      navigate('/', { replace: true })
    } catch {
      setServerError('회원가입에 실패했습니다. 이미 사용 중인 이메일일 수 있습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const EyeIcon = () => (
    <button type="button" onClick={() => setShowPassword((v) => !v)}>
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
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
      </div>

      <h1 className={styles.title}>회원가입</h1>
      <p className={styles.subtitle}>Missing PET 계정을 만들어보세요</p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="이메일"
          type="email"
          placeholder="이메일을 입력해주세요"
          value={form.email}
          onChange={handleChange('email')}
          errorMessage={errors.email}
          autoComplete="email"
        />
        <Input
          label="닉네임"
          type="text"
          placeholder="사용할 닉네임을 입력해주세요"
          value={form.nickname}
          onChange={handleChange('nickname')}
          errorMessage={errors.nickname}
        />
        <div>
          <Input
            label="비밀번호"
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호를 입력해주세요"
            value={form.password}
            onChange={handleChange('password')}
            errorMessage={errors.password}
            rightElement={<EyeIcon />}
            autoComplete="new-password"
          />
          {!errors.password && (
            <p className={styles.passwordHint}>8자 이상, 영문과 숫자를 포함해주세요</p>
          )}
        </div>
        <Input
          label="비밀번호 확인"
          type={showPassword ? 'text' : 'password'}
          placeholder="비밀번호를 다시 입력해주세요"
          value={form.passwordConfirm}
          onChange={handleChange('passwordConfirm')}
          errorMessage={errors.passwordConfirm}
          autoComplete="new-password"
        />

        {serverError && <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>{serverError}</p>}

        <div className={styles.submitButton}>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '가입 중...' : '가입하기'}
          </Button>
          <p className={styles.loginLink}>
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </div>
      </form>
    </div>
  )
}
