import { useEffect, useState } from 'react'
import type { MatchingResult } from '@/types'
import { MOCK_POSTS } from '@/utils/mockData'
import styles from './Step2Analyzing.module.css'

interface Props {
  onComplete: (results: MatchingResult[]) => void
}

// 분석 단계 텍스트 (No.70)
const ANALYSIS_STAGES = [
  '데이터베이스 조회 중...',
  '특징점 추출 중...',
  '유사도 매칭 중...',
  '결과 정렬 중...',
]

// 목 매칭 결과 생성
const generateMockResults = (): MatchingResult[] => {
  const missingPosts = MOCK_POSTS.filter((p) => p.status === 'missing')
  return missingPosts
    .map((post) => ({
      postId: post.id,
      post,
      similarityScore: Math.floor(Math.random() * 40) + 55, // 55~95%
    }))
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 3)
}

// No.70 분석 진행 상태 UI
export default function Step2Analyzing({ onComplete }: Props) {
  const [progress, setProgress] = useState(0)
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    // 진행률 바 애니메이션 (3초 동안 0→100%)
    const totalDuration = 3000
    const interval = 50
    const step = (interval / totalDuration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step
        // 단계 전환
        const newStage = Math.floor((next / 100) * (ANALYSIS_STAGES.length - 1))
        setStageIndex(Math.min(newStage, ANALYSIS_STAGES.length - 1))
        if (next >= 100) {
          clearInterval(timer)
          return 100
        }
        return next
      })
    }, interval)

    // 3초 후 완료 → 결과 페이지로
    const completeTimer = setTimeout(() => {
      onComplete(generateMockResults())
    }, totalDuration + 300)

    return () => {
      clearInterval(timer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

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
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
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
