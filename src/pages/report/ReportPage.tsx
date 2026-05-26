import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { LostTimezone, MissingPost } from '@/types'
import { petsService } from '@/services/pets'
import { uploadService } from '@/services/upload'
import { toBackendPet } from '@/utils/transform'
import Step1Location from './steps/Step1Location'
import Step2Photos from './steps/Step2Photos'
import Step3PetInfo from './steps/Step3PetInfo'
import Step4LostTime from './steps/Step4LostTime'
import Step5Reward from './steps/Step5Reward'
import styles from './ReportPage.module.css'

export interface ReportFormData {
  address: string
  detailAddress: string
  lat?: number  // 지도 클릭으로 선택된 위도
  lng?: number  // 지도 클릭으로 선택된 경도
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
  address: '', detailAddress: '', lat: undefined, lng: undefined, photos: [],
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

// base64 data URL → File 변환
const dataUrlToFile = (dataUrl: string, index: number): File => {
  const [header, b64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const ext = mime.split('/')[1] ?? 'jpg'
  const binary = atob(b64)
  const buffer = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i)
  return new File([buffer], `photo_${index}.${ext}`, { type: mime })
}

export default function ReportPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // 수정 모드: ?edit=postId 쿼리 파라미터로 진입
  const editId = searchParams.get('edit')
  const isEdit = Boolean(editId)

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<ReportFormData>(INITIAL_FORM)
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // 수정 모드: API에서 기존 게시글 로드
  useEffect(() => {
    if (!editId) return
    petsService
      .getPet(editId)
      .then((post: MissingPost) => {
        setForm({
          address: post.location.address,
          detailAddress: post.location.detailAddress ?? '',
          photos: post.images,
          petName: post.petName,
          species: post.species,
          age: post.age?.toString() ?? '',
          gender: post.gender ?? '',
          furColor: post.furColor ?? '',
          description: post.description ?? '',
          lostDate: post.lostAt.split('T')[0],
          lostTimezone: post.lostTimezone,
          reward: post.reward,
        })
      })
      .catch(() => navigate('/', { replace: true }))
      .finally(() => setIsLoadingEdit(false))
  }, [editId, navigate])

  const update = (partial: Partial<ReportFormData>) =>
    setForm((prev) => ({ ...prev, ...partial }))

  const goNext = () => setStep((s) => Math.min(s + 1, 5))
  const goBack = () => {
    if (step === 1) navigate('/')
    else setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      // 기존 URL(수정 모드)은 그대로, base64는 업로드 후 path 획득
      const existingUrls = form.photos.filter((p) => p.startsWith('http'))
      const base64List = form.photos.filter((p) => p.startsWith('data:'))

      let uploadedPaths: string[] = []
      if (base64List.length > 0) {
        const files = base64List.map(dataUrlToFile)
        uploadedPaths = await uploadService.uploadPetPhotos(files)
      }

      const photoUrls = [...existingUrls, ...uploadedPaths]
      const backendData = toBackendPet(form, photoUrls)

      if (editId) {
        await petsService.updatePet(editId, backendData)
      } else {
        await petsService.createPet(backendData)
      }
      navigate('/', { replace: true })
    } catch {
      setSubmitError('게시글 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingEdit) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>불러오는 중...</div>
      </div>
    )
  }

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
          <>
            <Step5Reward
              form={form}
              update={update}
              onSubmit={handleSubmit}
              isEdit={isEdit}
              isSubmitting={isSubmitting}
            />
            {submitError && (
              <p style={{ color: 'var(--color-error)', textAlign: 'center', padding: '0.5rem' }}>
                {submitError}
              </p>
            )}
          </>
        )}
      </main>
    </div>
  )
}
