import type { LostTimezone } from '@/types'
import type { ReportFormData } from '../ReportPage'
import styles from './Step4LostTime.module.css'

interface Props {
  form: ReportFormData
  update: (partial: Partial<ReportFormData>) => void
  onNext: () => void
}

const TIMEZONES: { value: LostTimezone; label: string; sub: string }[] = [
  { value: 'dawn', label: '새벽', sub: '0시 ~ 6시' },
  { value: 'morning', label: '오전', sub: '6시 ~ 12시' },
  { value: 'afternoon', label: '오후', sub: '12시 ~ 18시' },
  { value: 'evening', label: '저녁', sub: '18시 ~ 24시' },
]

// No.57 날짜 선택 캘린더 / No.58 시간대 선택 (6개 구간 중 4개 적용)
export default function Step4LostTime({ form, update, onNext }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const canNext = form.lostDate.length > 0 && form.lostTimezone.length > 0

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h2 className={styles.stepTitle}>실종 시기를 알려주세요</h2>
          <p className={styles.stepDesc}>마지막으로 본 날짜와 시간대를 선택해주세요</p>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              실종 날짜 <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              className={styles.input}
              value={form.lostDate}
              max={today}
              onChange={(e) => update({ lostDate: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              시간대 <span className={styles.required}>*</span>
            </label>
            <div className={styles.timezoneGrid}>
              {TIMEZONES.map(({ value, label, sub }) => (
                <button
                  key={value}
                  className={[
                    styles.tzBtn,
                    form.lostTimezone === value ? styles.tzSelected : '',
                  ].join(' ')}
                  onClick={() => update({ lostTimezone: value })}
                >
                  <span className={styles.tzLabel}>{label}</span>
                  <span className={styles.tzSub}>{sub}</span>
                </button>
              ))}
            </div>
          </div>
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
