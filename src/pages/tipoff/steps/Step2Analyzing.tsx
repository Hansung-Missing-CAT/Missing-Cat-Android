import { useEffect, useState, useRef } from 'react'
import type { MatchingResult } from '@/types'
import { tipsService } from '@/services/tips'
import { socketService } from '@/services/socket'
import styles from './Step2Analyzing.module.css'

interface Props {
  tipId?: string  // 실제 분석 ID. 없으면 mock 애니메이션으로 fallback
  onComplete: (results: MatchingResult[]) => void
}

// 분석 단계 텍스트 (No.70)
const ANALYSIS_STAGES = [
  '데이터베이스 조회 중...',
  '특징점 추출 중...',
  '유사도 매칭 중...',
  '결과 정렬 중...',
]

// No.70 분석 진행 상태 UI
export default function Step2Analyzing({ tipId, onComplete }: Props) {
  const [progress, setProgress] = useState(0)
  const [stageIndex, setStageIndex] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const cleanupRef = useRef<(() => void) | null>(null)

  // 진행률에 따라 단계 인덱스 계산
  const updateStage = (pct: number) => {
    const stage = Math.min(
      Math.floor((pct / 100) * ANALYSIS_STAGES.length),
      ANALYSIS_STAGES.length - 1,
    )
    setStageIndex(stage)
    setProgress(pct)
  }

  useEffect(() => {
    if (tipId) {
      // 실제 API 폴링 + 소켓 이벤트 동시 처리
      socketService.onTipProgress(({ tipId: id, progress: pct }) => {
        if (id === tipId) updateStage(pct)
      })

      socketService.onTipComplete(({ tipId: id }) => {
        if (id !== tipId) return
        socketService.off('tip.progress')
        socketService.off('tip.complete')
        // 소켓 결과는 변환 없이 직접 완료 처리 (백엔드 포맷이면 tipsService.getTipStatus 결과 사용)
        void tipsService.getTipStatus(tipId).then((res) => {
          if (res.status === 'done') onComplete(res.results ?? [])
        })
      })

      // 폴링 시작 (소켓이 없을 때 fallback)
      const stopPolling = tipsService.pollTipStatus(
        tipId,
        (pct) => updateStage(pct),
        (results) => {
          socketService.off('tip.progress')
          socketService.off('tip.complete')
          onComplete(results)
        },
        (msg) => setErrorMsg(msg ?? '분석 중 오류가 발생했습니다.'),
      )
      cleanupRef.current = () => {
        stopPolling()
        socketService.off('tip.progress')
        socketService.off('tip.complete')
      }
    } else {
      // tipId 없는 경우 — mock 애니메이션 (3초)
      const totalDuration = 3000
      const interval = 50
      const step = (interval / totalDuration) * 100

      const timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev + step
          const newStage = Math.floor((next / 100) * (ANALYSIS_STAGES.length - 1))
          setStageIndex(Math.min(newStage, ANALYSIS_STAGES.length - 1))
          return next >= 100 ? (clearInterval(timer), 100) : next
        })
      }, interval)

      const completeTimer = setTimeout(() => {
        onComplete([]) // 빈 결과로 완료
      }, totalDuration + 300)

      cleanupRef.current = () => {
        clearInterval(timer)
        clearTimeout(completeTimer)
      }
    }

    return () => cleanupRef.current?.()
  }, [tipId, onComplete])

  if (errorMsg) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <p style={{ color: 'var(--color-error)', textAlign: 'center' }}>{errorMsg}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        {/* 분석 중 아이콘 */}
        <div className={styles.iconWrapper}>
          <div className={styles.pulse} />
          <div className={styles.catIcon}>🐱</div>
        </div>

        <h2 className={styles.title}>AI가 분석하고 있어요</h2>
        <p className={styles.subtitle}>등록된 실종 사례와 사진을 비교하고 있습니다</p>

        {/* 진행률 바 */}
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressMeta}>
            <span className={styles.stageText}>{ANALYSIS_STAGES[stageIndex]}</span>
            <span className={styles.progressPct}>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* 단계 목록 */}
        <div className={styles.stages}>
          {ANALYSIS_STAGES.map((stage, i) => {
            const isDone = i < stageIndex
            const isActive = i === stageIndex
            return (
              <div
                key={stage}
                className={`${styles.stageItem} ${isDone ? styles.stageDone : ''} ${isActive ? styles.stageActive : ''}`}
              >
                <span className={styles.stageDot}>
                  {isDone ? '✓' : isActive ? '◉' : '○'}
                </span>
                <span className={styles.stageLabel}>{stage}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
