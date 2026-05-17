import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MOCK_POSTS, MOCK_COMMENTS } from '@/utils/mockData'
import styles from './PostDetailPage.module.css'

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.79h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.34a16 16 0 0 0 5.74 5.74l1.62-1.64a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const LOST_TIMEZONE_LABELS: Record<string, string> = {
  dawn: '새벽 (0~6시)',
  morning: '오전 (6~12시)',
  afternoon: '오후 (12~18시)',
  evening: '저녁 (18~24시)',
}

// 피드 상세 페이지 (NavBar 없음)
export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const post = MOCK_POSTS.find((p) => p.id === id)
  const comments = MOCK_COMMENTS.filter((c) => c.postId === id)
  const [commentText, setCommentText] = useState('')
  const [liked, setLiked] = useState(post?.isLiked ?? false)
  const [likeCount, setLikeCount] = useState(post?.likeCount ?? 0)
  const [photoIndex, setPhotoIndex] = useState(0)

  if (!post) {
    return (
      <div className={styles.notFound}>
        <p>게시글을 찾을 수 없어요.</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>돌아가기</button>
      </div>
    )
  }

  const handleLike = () => {
    setLiked((prev) => !prev)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))
    // TODO: API 연동
  }

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return
    // TODO: API 연동
    setCommentText('')
  }

  const lostDate = new Date(post.lostAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className={styles.page}>
      {/* 고정 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <BackIcon />
        </button>
        <h1 className={styles.headerTitle}>실종 게시글</h1>
        <button
          className={`${styles.likeBtn} ${liked ? styles.liked : ''}`}
          onClick={handleLike}
          aria-label="좋아요"
        >
          <HeartIcon filled={liked} />
          <span>{likeCount}</span>
        </button>
      </header>

      {/* 스크롤 영역 */}
      <main className={styles.main}>
        {/* 사진 슬라이더 */}
        <div className={styles.photoArea}>
          {post.images.length > 0 ? (
            <>
              <img src={post.images[photoIndex]} alt={post.petName} className={styles.photo} />
              {post.images.length > 1 && (
                <div className={styles.photoDots}>
                  {post.images.map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.dot} ${i === photoIndex ? styles.activeDot : ''}`}
                      onClick={() => setPhotoIndex(i)}
                      aria-label={`사진 ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.photoPlaceholder}>
              <span>🐱</span>
            </div>
          )}
          <span className={`${styles.statusBadge} ${post.status === 'found' ? styles.found : styles.missing}`}>
            {post.status === 'found' ? '찾음' : '실종중'}
          </span>
        </div>

        {/* 기본 정보 */}
        <section className={styles.section}>
          <div className={styles.petHeader}>
            <div>
              <h2 className={styles.petName}>{post.petName}</h2>
              <p className={styles.petMeta}>
                {post.species}
                {post.gender ? ` · ${post.gender === 'male' ? '수컷' : '암컷'}` : ''}
                {post.age ? ` · ${post.age}살` : ''}
              </p>
            </div>
            <div className={styles.authorInfo}>
              <div className={styles.avatar}>{post.authorNickname[0]}</div>
              <span className={styles.authorName}>{post.authorNickname}</span>
            </div>
          </div>
          {post.furColor && (
            <p className={styles.detailRow}>
              <span className={styles.detailLabel}>털 색상</span>
              <span>{post.furColor}</span>
            </p>
          )}
          {post.description && <p className={styles.description}>{post.description}</p>}
        </section>

        <div className={styles.divider} />

        {/* 실종 정보 */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>실종 정보</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>실종 위치</span>
              <span className={styles.infoValue}>{post.location.address}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>실종 날짜</span>
              <span className={styles.infoValue}>{lostDate}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>시간대</span>
              <span className={styles.infoValue}>{LOST_TIMEZONE_LABELS[post.lostTimezone]}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>사례금</span>
              <span className={`${styles.infoValue} ${styles.rewardValue}`}>
                {post.reward === 0 ? '없음' : `${post.reward.toLocaleString('ko-KR')}원`}
              </span>
            </div>
          </div>
        </section>

        {/* 지도 placeholder */}
        <div className={styles.mapPlaceholder}>
          <p className={styles.mapAddress}>📍 {post.location.address}</p>
          <p className={styles.mapNote}>지도는 카카오맵 연동 후 표시됩니다</p>
        </div>

        {/* 제보/전화 버튼 */}
        <div className={styles.actionButtons}>
          <button className={styles.phoneBtn}>
            <PhoneIcon />
            전화하기
          </button>
          <button className={styles.tipoffBtn} onClick={() => navigate('/tipoff')}>
            제보하기
          </button>
        </div>

        <div className={styles.divider} />

        {/* 댓글 */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>댓글 {post.commentCount}개</h3>
          {comments.length > 0 ? (
            <ul className={styles.commentList}>
              {comments.map((c) => (
                <li key={c.id} className={styles.commentItem}>
                  <div className={styles.commentAvatar}>{c.authorNickname[0]}</div>
                  <div className={styles.commentBody}>
                    <div className={styles.commentTop}>
                      <span className={styles.commentAuthor}>{c.authorNickname}</span>
                      <span className={styles.commentTime}>
                        {new Date(c.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className={styles.commentText}>{c.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noComment}>첫 댓글을 남겨보세요!</p>
          )}
        </section>
      </main>

      {/* 고정 댓글 입력창 */}
      <footer className={styles.footer}>
        <input
          type="text"
          placeholder="댓글을 입력하세요..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className={styles.commentInput}
          onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
        />
        <button
          className={styles.sendBtn}
          onClick={handleCommentSubmit}
          disabled={!commentText.trim()}
          aria-label="전송"
        >
          <SendIcon />
        </button>
      </footer>
    </div>
  )
}
