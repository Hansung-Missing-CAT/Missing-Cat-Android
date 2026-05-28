import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MatchingResult } from '@/types'
import type { TipOffFormData } from '../TipOffPage'
import { tipsService } from '@/services/tips'
import styles from './Step3Results.module.css'

// types/index.ts에 TipOffFormData가 다르게 정의되어 있으므로 prop 타입은 TipOffPage의 것을 사용
interface Props {
  results: MatchingResult[]
  tipOffForm: TipOffFormData
  tipId: string | null
}

const SIMILARITY_COLORS: Record<string, string> = {
  high: '#388e3c',
  mid: '#f57c00',
  low: '#757575',
}

function getSimilarityLevel(score: number) {
  if (score >= 80) return 'high'
  if (score >= 65) return 'mid'
  return 'low'
}

function getSimilarityLabel(score: number) {
  if (score >= 80) return '매우 유사'
  if (score >= 65) return '유사 가능성'
  return '낮은 유사도'
}

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// No.71 매칭 결과 목록 / No.72 상세 페이지 연결 / No.73 제보 전송 버튼
export default function Step3Results({ results, tipOffForm, tipId }: Props) {
  const navigate = useNavigate()
  const [sentPostIds, setSentPostIds] = useState<Set<string>>(new Set())
  const [sendingPostId, setSendingPostId] = useState<string | null>(null)

  // No.73 보호자에게 제보 전송 → 채팅방으로 이동
  const handleSend = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('[DEBUG] handleSend postId:', postId, 'tipId:', tipId)
    if (!tipId || sendingPostId === postId) return
    setSendingPostId(postId)
    try {
      const { chatId } = await tipsService.sendTip(tipId, postId)
      setSentPostIds((prev) => new Set(prev).add(postId))
      navigate(`/chat/${chatId}`)
    } catch {
      setSendingPostId(null)
    }
  }

  // No.72 매칭 결과 카드 → 상세 페이지 이동
  const handleCardClick = (postId: string) => {
    navigate(`/post/${postId}`)
  }

  if (results.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🔍</span>
          <h2 className={styles.emptyTitle}>매칭 결과 없음</h2>
          <p className={styles.emptyDesc}>
            현재 등록된 실종 사례 중 유사한 고양이를 찾지 못했어요.
            <br />새로운 신고가 등록되면 자동으로 알림을 보내드려요.
          </p>
          <button className={styles.homeBtn} onClick={() => navigate('/')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 결과 헤더 */}
        <div className={styles.resultHeader}>
          <div className={styles.resultBadge}>
            <span className={styles.resultCount}>{results.length}건</span>
          </div>
          <div>
            <h2 className={styles.resultTitle}>유사한 실종 사례를 찾았어요</h2>
            <p className={styles.resultSubtitle}>
              제보 사진 위치: {tipOffForm.address}
              {tipOffForm.detailAddress && ` · ${tipOffForm.detailAddress}`}
            </p>
          </div>
        </div>

        {/* 매칭 결과 카드 목록 */}
        <div className={styles.list}>
          {results.map((result, index) => {
            const { post, similarityScore } = result
            const level = getSimilarityLevel(similarityScore)
            const isSent = sentPostIds.has(result.postId)

            return (
              <div
                key={result.postId}
                className={styles.card}
                onClick={() => handleCardClick(result.postId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(result.postId)}
              >
                {/* 순위 뱃지 */}
                {index === 0 && <div className={styles.rankBadge}>최고 유사</div>}

                <div className={styles.cardRow}>
                  {/* 사진 자리 (실제 API 연동 시 이미지 표시) */}
                  <div className={styles.thumbnail}>
                    <span className={styles.thumbEmoji}>🐱</span>
                  </div>

                  <div className={styles.cardInfo}>
                    <div className={styles.cardTop}>
                      <span className={styles.petName}>{post.petName}</span>
                      <span className={styles.species}>{post.species}</span>
                    </div>
                    <p className={styles.location}>{post.location.address}</p>
                    {post.reward > 0 && (
                      <p className={styles.reward}>사례금 {post.reward.toLocaleString()}원</p>
                    )}

                    {/* 유사도 표시 */}
                    <div className={styles.similarity}>
                      <div className={styles.similarityBar}>
                        <div
                          className={styles.similarityFill}
                          style={{
                            width: `${similarityScore}%`,
                            background: SIMILARITY_COLORS[level],
                          }}
                        />
                      </div>
                      <span
                        className={styles.similarityScore}
                        style={{ color: SIMILARITY_COLORS[level] }}
                      >
                        {similarityScore}% {getSimilarityLabel(similarityScore)}
                      </span>
                    </div>
                  </div>

                  <ChevronIcon />
                </div>

                {/* No.73 제보 전송 버튼 */}
                <button
                  className={`${styles.sendBtn} ${isSent ? styles.sendBtnDone : ''}`}
                  onClick={(e) => { void handleSend(result.postId, e) }}
                  disabled={isSent || sendingPostId === result.postId}
                >
                  <SendIcon />
                  {isSent
                    ? '제보 전송 완료'
                    : sendingPostId === result.postId
                    ? '전송 중...'
                    : '보호자에게 제보 전송'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.homeBtn} onClick={() => navigate('/')}>
          홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}
