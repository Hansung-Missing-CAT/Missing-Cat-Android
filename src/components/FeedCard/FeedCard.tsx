import { useState } from 'react'
import axios from 'axios'
import type { MissingPost } from '@/types'
import LazyImage from '@/components/LazyImage/LazyImage'
import { petsService } from '@/services/pets'
import { useAuthStore } from '@/stores/authStore'
import * as likeStorage from '@/utils/likeStorage'
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
  // 초기 좋아요 상태: localStorage 우선 (백엔드 is_liked는 항상 undefined)
  const [liked, setLiked] = useState(() => likeStorage.isLiked(post.id) || (post.isLiked ?? false))
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const { user } = useAuthStore()

  // 작성자명: 빈값/'익명'이면 본인 게시글은 닉네임, 타인 게시글은 '작성자'로 표시
  const displayAuthor =
    post.authorNickname && post.authorNickname !== '익명'
      ? post.authorNickname
      : post.userId === user?.id
        ? (user.nickname ?? '작성자')
        : '작성자'

  // 좋아요 토글 — API 응답 후 UI 확정, localStorage에 상태 영구 저장
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (liked) {
      // 좋아요 취소: 성공/실패 모두 liked=false로 확정 (이미 취소 상태 포함)
      try {
        await petsService.unlikePet(post.id)
        setLikeCount((prev) => prev - 1)
      } catch {
        // 에러 시 count는 유지
      } finally {
        likeStorage.setUnliked(post.id)
        setLiked(false)
      }
    } else {
      // 좋아요: 성공 시 liked=true + count+1, 409는 이미 좋아요 상태로 확정
      try {
        await petsService.likePet(post.id)
        likeStorage.setLiked(post.id)
        setLiked(true)
        setLikeCount((prev) => prev + 1)
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          // 409: 이미 좋아요 상태 — localStorage 동기화, count는 변경 안 함
          likeStorage.setLiked(post.id)
          setLiked(true)
        }
        // 그 외 에러: UI/localStorage 변경 없음
      }
    }
  }

  return (
    <article className={styles.card} onClick={onClick}>
      {/* 사진 영역 (1:1 정방형) */}
      <div className={styles.imageWrapper}>
        {post.images?.[0] ? (
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
        <p className={styles.author}>{displayAuthor}</p>
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
