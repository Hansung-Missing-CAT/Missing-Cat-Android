import { useState } from 'react'
import type { ReportFormData } from '../ReportPage'
import styles from './Step5Reward.module.css'

interface Props {
  form: ReportFormData
  update: (partial: Partial<ReportFormData>) => void
  onSubmit: () => void
  isEdit: boolean
}

const PRESETS = [
  { label: '없음', value: 0 },
  { label: '3만원', value: 30000 },
  { label: '5만원', value: 50000 },
  { label: '10만원', value: 100000 },
  { label: '20만원', value: 200000 },
  { label: '50만원', value: 500000 },
]

// No.59 프리셋 버튼 / No.60 직접 입력 / No.61 신고 접수하기
export default function Step5Reward({ form, update, onSubmit, isEdit }: Props) {
  const [isCustom, setIsCustom] = useState(false)
  const [customValue, setCustomValue] = useState(
    // 수정 모드에서 기존 값이 프리셋에 없을 경우 직접 입력으로 초기화
    PRESETS.some((p) => p.value === form.reward) ? '' : form.reward.toString(),
  )

  const selectPreset = (value: number) => {
    setIsCustom(false)
    setCustomValue('')
    update({ reward: value })
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setCustomValue(val)
    update({ reward: val ? parseInt(val, 10) : 0 })
  }

  const isPresetSelected = (value: number) =>
    !isCustom && form.reward === value

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h2 className={styles.stepTitle}>사례금을 설정해주세요</h2>
          <p className={styles.stepDesc}>반려동물을 찾아주시는 분께 드릴 사례금을 선택하세요</p>
        </div>

        {/* 프리셋 버튼 */}
        <div className={styles.presets}>
          {PRESETS.map(({ label, value }) => (
            <button
              key={value}
              className={[styles.presetBtn, isPresetSelected(value) ? styles.selected : ''].join(' ')}
              onClick={() => selectPreset(value)}
            >
              {label}
            </button>
          ))}
          <button
            className={[styles.presetBtn, isCustom ? styles.selected : ''].join(' ')}
            onClick={() => {
              setIsCustom(true)
              update({ reward: 0 })
            }}
          >
            직접 입력
          </button>
        </div>

        {/* 직접 입력 필드 */}
        {isCustom && (
          <div className={styles.customField}>
            <input
              type="text"
              className={styles.customInput}
              placeholder="금액을 입력하세요"
              value={customValue}
              onChange={handleCustomChange}
              inputMode="numeric"
              autoFocus
            />
            <span className={styles.unit}>원</span>
          </div>
        )}

        {/* 선택 미리보기 */}
        {form.reward > 0 && (
          <p className={styles.rewardPreview}>
            설정된 사례금: <strong>{form.reward.toLocaleString('ko-KR')}원</strong>
          </p>
        )}
        {form.reward === 0 && isPresetSelected(0) && (
          <p className={styles.rewardPreview}>사례금 없음으로 설정됩니다</p>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.submitBtn} onClick={onSubmit}>
          {isEdit ? '수정 완료' : '신고 접수하기'}
        </button>
      </div>
    </div>
  )
}
