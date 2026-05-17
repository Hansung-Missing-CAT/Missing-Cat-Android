import { useRef } from 'react'
import type { TipOffFormData } from '../TipOffPage'
import styles from './Step1Upload.module.css'

interface Props {
  form: TipOffFormData
  update: (partial: Partial<TipOffFormData>) => void
  onStartAnalysis: () => void
}

const MIN_PHOTOS = 3

const PlusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const PinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

// No.65 제보 사진 업로드 UI / No.66 촬영 가이드 / No.67 발견 위치 입력 / No.68 분석 준비 완료 표시
export default function Step1Upload({ form, update, onStartAnalysis }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canAnalyze = form.photos.length >= MIN_PHOTOS && form.address.trim().length > 0
  const photoReady = form.photos.length >= MIN_PHOTOS
  const locationReady = form.address.trim().length > 0

  // 갤러리 선택: 파일 → base64 변환
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const readers = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (ev) => resolve(ev.target?.result as string)
          reader.readAsDataURL(file)
        }),
    )

    Promise.all(readers).then((newPhotos) => {
      update({ photos: [...form.photos, ...newPhotos] })
    })
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    update({ photos: form.photos.filter((_, i) => i !== index) })
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 섹션 1: 사진 업로드 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>
              <span className={photoReady ? styles.badgeDone : styles.badgePending}>
                {photoReady ? '✓' : '1'}
              </span>
            </div>
            <div>
              <h2 className={styles.sectionTitle}>발견한 고양이 사진</h2>
              <p className={styles.sectionDesc}>
                최소 <strong>{MIN_PHOTOS}장</strong> 이상 업로드해주세요
              </p>
            </div>
            <span className={`${styles.counter} ${photoReady ? styles.counterOk : ''}`}>
              {form.photos.length} / {MIN_PHOTOS}+
            </span>
          </div>

          {/* No.66 촬영 가이드 */}
          <div className={styles.guide}>
            <p className={styles.guideTitle}>촬영 가이드</p>
            <div className={styles.guideItems}>
              {['전체 모습', '얼굴 클로즈업', '특징적 무늬/부위'].map((g) => (
                <span key={g} className={styles.guideTag}>{g}</span>
              ))}
            </div>
          </div>

          {/* 사진 그리드 */}
          <div className={styles.grid}>
            {form.photos.map((photo, i) => (
              <div key={i} className={styles.photoItem}>
                <img src={photo} alt={`사진 ${i + 1}`} className={styles.photo} />
                <button
                  className={styles.removeBtn}
                  onClick={() => removePhoto(i)}
                  aria-label={`사진 ${i + 1} 삭제`}
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
            <button
              className={styles.addBtn}
              onClick={() => fileInputRef.current?.click()}
              aria-label="사진 추가"
            >
              <PlusIcon />
              <span>추가</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileChange}
          />
        </section>

        <div className={styles.divider} />

        {/* 섹션 2: 발견 위치 입력 (No.67) */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>
              <span className={locationReady ? styles.badgeDone : styles.badgePending}>
                {locationReady ? '✓' : '2'}
              </span>
            </div>
            <div>
              <h2 className={styles.sectionTitle}>발견 위치</h2>
              <p className={styles.sectionDesc}>고양이를 발견한 위치를 알려주세요</p>
            </div>
          </div>

          <div className={styles.locationForm}>
            <div className={styles.inputWrapper}>
              <PinIcon />
              <input
                type="text"
                className={styles.locationInput}
                placeholder="예: 서울시 마포구 합정동"
                value={form.address}
                onChange={(e) => update({ address: e.target.value })}
              />
              {form.address && (
                <button
                  className={styles.clearBtn}
                  onClick={() => update({ address: '' })}
                  aria-label="주소 지우기"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
            <div className={styles.inputWrapper}>
              <SearchIcon />
              <input
                type="text"
                className={styles.locationInput}
                placeholder="상세 주소 (선택): 예: 합정역 2번 출구"
                value={form.detailAddress}
                onChange={(e) => update({ detailAddress: e.target.value })}
              />
            </div>

            {/* 지도 플레이스홀더 (카카오맵 연동 전) */}
            <div className={styles.mapPlaceholder}>
              <span className={styles.mapEmoji}>🗺️</span>
              <p className={styles.mapLabel}>지도에서 위치 선택</p>
              <p className={styles.mapNote}>Phase 7 카카오맵 연동 후 이용 가능</p>
            </div>
          </div>
        </section>

        {/* No.68 분석 준비 완료 상태 표시 */}
        {canAnalyze && (
          <div className={styles.readyBanner}>
            <span className={styles.readyIcon}>✅</span>
            <span className={styles.readyText}>AI 분석 준비 완료! 사진 {form.photos.length}장 + 위치 등록됨</span>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        {!canAnalyze && (
          <p className={styles.hint}>
            {!photoReady && `사진 ${MIN_PHOTOS - form.photos.length}장 더 필요`}
            {!photoReady && !locationReady && ' · '}
            {!locationReady && '위치를 입력해주세요'}
          </p>
        )}
        {/* No.69 유사도 검증 시작 버튼 */}
        <button
          className={`${styles.analyzeBtn} ${!canAnalyze ? styles.disabled : ''}`}
          onClick={onStartAnalysis}
          disabled={!canAnalyze}
        >
          AI 유사도 검증 시작
        </button>
      </div>
    </div>
  )
}
