import { useState } from 'react'
import type { MissingPost } from '@/types'
import LazyImage from '@/components/LazyImage/LazyImage'
import { petsService } from '@/services/pets'
import styles from './FeedCard.module.css'

interface FeedCardProps {
  post: MissingPost
  onClick: () => void
}

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

// 사례금 포맷 (0원이면 "없음")
function formatReward(reward: number): string {
  if (reward === 0) return '없음'
  return reward.toLocaleString('ko-KR') + '원'
}

// 경과 시간 계산
function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor(diff / 60000)
  if (days > 0) return `${days}일 전`
  if (hours > 0) return `${hours}시간 전`
  if (minutes > 0) return `${minutes}분 전`
  return '방금 전'
}

// 피드 카드 컴포넌트 (고양이 사진 + 기본 정보 + 좋아요/댓글)
export default function FeedCard({ post, onClick }: FeedCardProps) {
  const [liked, setLiked] = useState(post.isLiked ?? false)
  const [likeCount, setLikeCount] = useState(post.likeCount)

  // 낙관적 업데이트: UI 먼저 변경 → API 실패 시 롤백
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1))
    try {
      if (wasLiked) {
        await petsService.unlikePet(post.id)
      } else {
        await petsService.likePet(post.id)
      }
    } catch {
      // API 실패 시 롤백
      setLiked(wasLiked)
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1))
    }
  }

  return (
    <article className={styles.card} onClick={onClick}>
      {/* 사진 영역 (1:1 정방형) */}
      <div className={styles.imageWrapper}>
        {post.images[0] ? (
          <LazyImage
            src={post.images[0]}
            alt={post.petName}
            className={styles.image}
            fallback={
              <div className={styles.imagePlaceholder}>
                <span className={styles.catEmoji}>🐱</span>
              </div>
            }
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.catEmoji}>🐱</span>
          </div>
        )}
        <span className={`${styles.statusBadge} ${post.status === 'found' ? styles.found : styles.missing}`}>
          {post.status === 'found' ? '찾음' : '실종중'}
        </span>
      </div>

      {/* 정보 영역 */}
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.petName}>{post.petName}</span>
          <span className={styles.species}>{post.species}</span>
        </div>
        <p className={styles.location}>📍 {post.location.address}</p>
        <div className={styles.bottomRow}>
          <span className={styles.reward}>
            사례금&nbsp;<strong>{formatReward(post.reward)}</strong>
          </span>
          <span className={styles.timeAgo}>{getTimeAgo(post.createdAt)}</span>
        </div>
        <div className={styles.reactions}>
          <button
            className={`${styles.reactionBtn} ${liked ? styles.liked : ''}`}
            onClick={handleLike}
            aria-label="좋아요"
          >
            <HeartIcon filled={liked} />
            <span>{likeCount}</span>
          </button>
          <span className={styles.reactionBtn}>
            <CommentIcon />
            <span>{post.commentCount}</span>
          </span>
        </div>
      </div>
    </article>
  )
}
