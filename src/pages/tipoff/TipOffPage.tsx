import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MatchingResult } from '@/types'
import Step1Upload from './steps/Step1Upload'
import Step2Analyzing from './steps/Step2Analyzing'
import Step3Results from './steps/Step3Results'
import styles from './TipOffPage.module.css'

export interface TipOffFormData {
  photos: string[]
  address: string
  detailAddress: string
}

const INITIAL_FORM: TipOffFormData = {
  photos: [],
  address: '',
  detailAddress: '',
}

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

export default function TipOffPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<TipOffFormData>(INITIAL_FORM)
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([])

  const update = (partial: Partial<TipOffFormData>) =>
    setForm((prev) => ({ ...prev, ...partial }))

  // 분석 시작 → Step 2 (분석 중)
  const handleStartAnalysis = () => setStep(2)

  // 분석 완료 → Step 3 (결과 표시)
  const handleAnalysisComplete = (results: MatchingResult[]) => {
    setMatchingResults(results)
    setStep(3)
  }

  // 뒤로가기
  const goBack = () => {
    if (step === 1) navigate('/')
    else if (step === 2) setStep(1)
    else setStep(2)
  }

  const STEP_TITLES: Record<number, string> = {
    1: '제보하기',
    2: 'AI 분석 중',
    3: '매칭 결과',
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={goBack} aria-label="뒤로가기">
          <BackIcon />
        </button>
        <h1 className={styles.title}>{STEP_TITLES[step]}</h1>
        <span className={styles.stepIndicator}>{step} / 3</span>
      </header>

      <main className={styles.main}>
        {step === 1 && (
          <Step1Upload form={form} update={update} onStartAnalysis={handleStartAnalysis} />
        )}
        {step === 2 && (
          <Step2Analyzing onComplete={handleAnalysisComplete} />
        )}
        {step === 3 && (
          <Step3Results results={matchingResults} tipOffForm={form} />
        )}
      </main>
    </div>
  )
}
