import { useRef } from 'react'
import type { ReportFormData } from '../ReportPage'
import styles from './Step2Photos.module.css'

interface Props {
  form: ReportFormData
  update: (partial: Partial<ReportFormData>) => void
  onNext: () => void
}

const MIN_PHOTOS = 5

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

// No.49 다중 사진 업로드 UI / No.51 미리보기 및 삭제 / No.52 촬영 가이드
export default function Step2Photos({ form, update, onNext }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canNext = form.photos.length >= MIN_PHOTOS

  // No.50 갤러리 선택: 파일 → base64 변환
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
        <div className={styles.hero}>
          <h2 className={styles.stepTitle}>반려동물 사진을 올려주세요</h2>
          <p className={styles.stepDesc}>
            최소 <strong>{MIN_PHOTOS}장</strong> 이상 업로드해주세요
          </p>
          <span className={`${styles.counter} ${canNext ? styles.counterOk : ''}`}>
            {form.photos.length}장 / {MIN_PHOTOS}장 이상
          </span>
        </div>

        {/* 촬영 가이드 */}
        <div className={styles.guide}>
          <p className={styles.guideTitle}>📷 촬영 가이드</p>
          <ul className={styles.guideList}>
            <li>정면 전체 모습</li>
            <li>측면 모습</li>
            <li>얼굴 클로즈업</li>
            <li>특징적인 무늬나 신체 부위</li>
          </ul>
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
            <span>사진 추가</span>
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
      </div>

      <div className={styles.footer}>
        {!canNext && form.photos.length > 0 && (
          <p className={styles.hint}>{MIN_PHOTOS - form.photos.length}장 더 추가해주세요</p>
        )}
        <button
          className={[styles.nextBtn, !canNext ? styles.disabled : ''].join(' ')}
          onClick={onNext}
          disabled={!canNext}
        >
          다음
        </button>
      </div>
    </div>
  )
}
