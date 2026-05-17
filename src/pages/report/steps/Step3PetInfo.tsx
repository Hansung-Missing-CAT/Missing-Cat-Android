import type { ReportFormData } from '../ReportPage'
import styles from './Step3PetInfo.module.css'

interface Props {
  form: ReportFormData
  update: (partial: Partial<ReportFormData>) => void
  onNext: () => void
}

// No.53 이름 / No.54 품종 / No.55 나이·성별 / No.56 털 색상·특이사항
export default function Step3PetInfo({ form, update, onNext }: Props) {
  const canNext = form.petName.trim().length > 0 && form.species.trim().length > 0

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h2 className={styles.stepTitle}>반려동물 정보를 입력해주세요</h2>
          <p className={styles.stepDesc}>정확한 정보가 AI 매칭 정확도를 높입니다</p>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              이름 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="반려동물의 이름을 입력하세요"
              value={form.petName}
              onChange={(e) => update({ petName: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              품종 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="예: 코리안숏헤어, 페르시안"
              value={form.species}
              onChange={(e) => update({ species: e.target.value })}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>
                나이 <span className={styles.optional}>(선택)</span>
              </label>
              <div className={styles.ageInput}>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="예: 3"
                  min="0"
                  max="30"
                  value={form.age}
                  onChange={(e) => update({ age: e.target.value })}
                  inputMode="numeric"
                />
                <span className={styles.ageUnit}>살</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                성별 <span className={styles.optional}>(선택)</span>
              </label>
              <div className={styles.genderGroup}>
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    className={[
                      styles.genderBtn,
                      form.gender === g ? styles.genderSelected : '',
                    ].join(' ')}
                    onClick={() => update({ gender: form.gender === g ? '' : g })}
                  >
                    {g === 'male' ? '수컷' : '암컷'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              털 색상 <span className={styles.optional}>(선택)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="예: 흰색, 회색 줄무늬"
              value={form.furColor}
              onChange={(e) => update({ furColor: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              특이사항 <span className={styles.optional}>(선택)</span>
            </label>
            <textarea
              className={[styles.input, styles.textarea].join(' ')}
              placeholder="특징적인 외모, 행동 특성, 목줄 색상 등"
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
            />
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
