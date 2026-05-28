import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MatchingResult } from '@/types'
import { uploadService } from '@/services/upload'
import { tipsService } from '@/services/tips'
import Step1Upload from './steps/Step1Upload'
import Step2Analyzing from './steps/Step2Analyzing'
import Step3Results from './steps/Step3Results'
import styles from './TipOffPage.module.css'

export interface TipOffFormData {
  photos: string[]
  address: string
  detailAddress: string
  lat?: number
  lng?: number
}

const INITIAL_FORM: TipOffFormData = {
  photos: [],
  address: '',
  detailAddress: '',
  lat: undefined,
  lng: undefined,
}

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

// base64 data URL → File 변환
const dataUrlToFile = (dataUrl: string, index: number): File => {
  const [header, b64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const ext = mime.split('/')[1] ?? 'jpg'
  const binary = atob(b64)
  const buffer = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i)
  return new File([buffer], `tip_photo_${index}.${ext}`, { type: mime })
}

export default function TipOffPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<TipOffFormData>(INITIAL_FORM)
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([])
  const [tipId, setTipId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const update = (partial: Partial<TipOffFormData>) =>
    setForm((prev) => ({ ...prev, ...partial }))

  // 사진 업로드 → AI 분석 시작 → Step 2
  const handleStartAnalysis = async () => {
    setIsUploading(true)
    setUploadError('')
    try {
      const files = form.photos.map(dataUrlToFile)
      const imageUrls = await uploadService.uploadPetPhotos(files)
      const { tipId: id } = await tipsService.analyzeTip(imageUrls)
      setTipId(id)
      setStep(2)
    } catch {
      setUploadError('업로드 또는 분석 요청에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsUploading(false)
    }
  }

  // 분석 완료 → Step 3 (결과 표시)
  // useCallback으로 참조 안정화: 미적용 시 isUploading 변경마다 재렌더링되어
  // Step2Analyzing의 useEffect가 재실행되고 polling이 즉시 done을 감지해 조기 전환됨
  const handleAnalysisComplete = useCallback((results: MatchingResult[]) => {
    setMatchingResults(results)
    setStep(3)
  }, [])

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
          <>
            <Step1Upload
              form={form}
              update={update}
              onStartAnalysis={handleStartAnalysis}
              isUploading={isUploading}
            />
            {uploadError && (
              <p style={{ color: 'var(--color-error)', textAlign: 'center', padding: '0.5rem' }}>
                {uploadError}
              </p>
            )}
          </>
        )}
        {step === 2 && (
          <Step2Analyzing
            tipId={tipId ?? undefined}
            onComplete={handleAnalysisComplete}
          />
        )}
        {step === 3 && (
          <Step3Results
            results={matchingResults}
            tipOffForm={form}
            tipId={tipId}
          />
        )}
      </main>
    </div>
  )
}
