import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '@/components/Input/Input'
import Button from '@/components/Button/Button'
import { useAuth } from '@/hooks/useAuth'
import styles from './ProfilePage.module.css'

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [previewImg, setPreviewImg] = useState(user?.profileImage ?? '')
  const [nicknameError, setNicknameError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const initial = (user?.nickname ?? '?').slice(0, 1)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewImg(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const validate = () => {
    if (!nickname.trim()) {
      setNicknameError('닉네임을 입력해주세요')
      return false
    }
    if (nickname.trim().length < 2) {
      setNicknameError('닉네임은 2자 이상이어야 합니다')
      return false
    }
    setNicknameError('')
    return true
  }

  // 프로필 저장 (No.87)
  const handleSave = async () => {
    if (!validate()) return
    setIsSaving(true)
    try {
      // TODO: 프로필 수정 API 연동
      updateUser({
        nickname: nickname.trim(),
        phone: phone.trim() || undefined,
        profileImage: previewImg || undefined,
      })
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setNickname(user?.nickname ?? '')
    setPhone(user?.phone ?? '')
    setPreviewImg(user?.profileImage ?? '')
    setNicknameError('')
    setIsEditing(false)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <BackIcon />
        </button>
        <h1 className={styles.title}>프로필</h1>
        {isEditing ? (
          <span />
        ) : (
          <button className={styles.editBtn} onClick={() => setIsEditing(true)}>편집</button>
        )}
      </header>

      <div className={styles.body}>
        {/* 프로필 이미지 (No.86, 87) */}
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>
            {previewImg ? (
              <img src={previewImg} alt="프로필" className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitial}>{initial}</span>
            )}
          </div>
          {isEditing && (
            <button
              className={styles.cameraBtn}
              onClick={() => fileRef.current?.click()}
              aria-label="프로필 이미지 변경"
            >
              <CameraIcon />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={handleImageChange}
          />
        </div>

        {/* 편집 모드 */}
        {isEditing ? (
          <div className={styles.form}>
            <Input
              label="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              errorMessage={nicknameError}
              placeholder="닉네임을 입력해주세요"
            />
            <Input
              label="연락처 (선택)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
            />
            <div className={styles.readonlyField}>
              <span className={styles.readonlyLabel}>이메일</span>
              <span className={styles.readonlyValue}>{user?.email}</span>
            </div>
            <div className={styles.actions}>
              <Button variant="outline" onClick={handleCancel}>취소</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        ) : (
          /* 조회 모드 (No.86) */
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>닉네임</span>
              <span className={styles.infoValue}>{user?.nickname ?? '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>이메일</span>
              <span className={styles.infoValue}>{user?.email ?? '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>연락처</span>
              <span className={styles.infoValue}>{user?.phone ?? '-'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
