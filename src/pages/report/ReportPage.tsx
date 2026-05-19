import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { LostTimezone } from '@/types'
import { MOCK_POSTS } from '@/utils/mockData'
import Step1Location from './steps/Step1Location'
import Step2Photos from './steps/Step2Photos'
import Step3PetInfo from './steps/Step3PetInfo'
import Step4LostTime from './steps/Step4LostTime'
import Step5Reward from './steps/Step5Reward'
import styles from './ReportPage.module.css'

export interface ReportFormData {
  address: string
  detailAddress: string
  photos: string[]
  petName: string
  species: string
  age: string
  gender: 'male' | 'female' | ''
  furColor: string
  description: string
  lostDate: string
  lostTimezone: LostTimezone | ''
  reward: number
}

const STEP_LABELS = ['위치', '사진', '정보', '시기', '사례금']

const INITIAL_FORM: ReportFormData = {
  address: '', detailAddress: '', photos: [],
  petName: '', species: '', age: '', gender: '', furColor: '', description: '',
  lostDate: '', lostTimezone: '', reward: 0,
}

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function ReportPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // 수정 모드: ?edit=postId 쿼리 파라미터로 진입
  const editId = searchParams.get('edit')
  const editPost = editId ? MOCK_POSTS.find((p) => p.id === editId) : null

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<ReportFormData>(() => {
    if (!editPost) return INITIAL_FORM
    return {
      address: editPost.location.address,
      detailAddress: editPost.location.detailAddress ?? '',
      photos: editPost.images,
      petName: editPost.petName,
      species: editPost.species,
      age: editPost.age?.toString() ?? '',
      gender: editPost.gender ?? '',
      furColor: editPost.furColor ?? '',
      description: editPost.description ?? '',
      lostDate: editPost.lostAt.split('T')[0],
      lostTimezone: editPost.lostTimezone,
      reward: editPost.reward,
    }
  })

  const update = (partial: Partial<ReportFormData>) =>
    setForm((prev) => ({ ...prev, ...partial }))

  const goNext = () => setStep((s) => Math.min(s + 1, 5))
  const goBack = () => {
    if (step === 1) navigate('/')
    else setStep((s) => s - 1)
  }

  const handleSubmit = () => {
    // TODO: API 연동 (실종 신고 접수 또는 수정)
    navigate('/')
  }

  const isEdit = Boolean(editPost)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={goBack} aria-label="뒤로가기">
          <BackIcon />
        </button>
        <h1 className={styles.title}>{isEdit ? '신고 수정' : '실종 신고'}</h1>
        <span className={styles.stepCount}>{step} / 5</span>
      </header>

      {/* 스텝 프로그레스 바 (No.46) */}
      <div className={styles.progress}>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${((step - 1) / 4) * 100}%` }} />
        </div>
        <div className={styles.steps}>
          {STEP_LABELS.map((label, i) => {
            const num = i + 1
            const isDone = num < step
            const isActive = num === step
            return (
              <div key={label} className={styles.stepItem}>
                <div
                  className={[
                    styles.dot,
                    isDone ? styles.dotDone : '',
                    isActive ? styles.dotActive : '',
                  ].join(' ')}
                >
                  {isDone ? <CheckIcon /> : <span>{num}</span>}
                </div>
                <span className={[styles.stepLabel, isActive ? styles.labelActive : ''].join(' ')}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <main className={styles.main}>
        {step === 1 && <Step1Location form={form} update={update} onNext={goNext} />}
        {step === 2 && <Step2Photos form={form} update={update} onNext={goNext} />}
        {step === 3 && <Step3PetInfo form={form} update={update} onNext={goNext} />}
        {step === 4 && <Step4LostTime form={form} update={update} onNext={goNext} />}
        {step === 5 && (
          <Step5Reward
            form={form}
            update={update}
            onSubmit={handleSubmit}
            isEdit={isEdit}
          />
        )}
      </main>
    </div>
  )
}
