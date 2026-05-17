import type { ReportFormData } from '../ReportPage'
import styles from './Step1Location.module.css'

interface Props {
  form: ReportFormData
  update: (partial: Partial<ReportFormData>) => void
  onNext: () => void
}

const PinIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

// No.47 주소 직접 입력 폼 / No.48 주소 입력 UI
export default function Step1Location({ form, update, onNext }: Props) {
  const canNext = form.address.trim().length > 0

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <PinIcon />
          <h2 className={styles.stepTitle}>실종 위치를 알려주세요</h2>
          <p className={styles.stepDesc}>반려동물이 마지막으로 목격된 위치를 입력해주세요</p>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              주소 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="예: 서울시 마포구 합정동"
              value={form.address}
              onChange={(e) => update({ address: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              상세 주소 <span className={styles.optional}>(선택)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="예: 합정역 2번 출구 근처"
              value={form.detailAddress}
              onChange={(e) => update({ detailAddress: e.target.value })}
            />
          </div>
        </div>

        {/* No.47 지도 기반 위치 선택 — 카카오맵 연동 후 활성화 */}
        <div className={styles.mapPlaceholder}>
          <span className={styles.mapEmoji}>🗺️</span>
          <p className={styles.mapTitle}>지도에서 위치 선택</p>
          <p className={styles.mapNote}>카카오맵 연동 후 이용 가능합니다</p>
        </div>
      </div>

      <div className={styles.footer}>
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
