import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal, { ModalActions } from '@/components/Modal/Modal'
import { useAuth } from '@/hooks/useAuth'
import { MOCK_POSTS } from '@/utils/mockData'
import type { MissingPost, MissingStatus } from '@/types'
import styles from './MyPostsPage.module.css'

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

export default function MyPostsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // 내 게시글 목록 — API 연동 전 목 데이터 필터링 (없으면 데모용 상위 2건)
  const [posts, setPosts] = useState<MissingPost[]>(() => {
    const mine = MOCK_POSTS.filter((p) => p.userId === user?.id)
    return mine.length > 0 ? mine : MOCK_POSTS.slice(0, 2)
  })

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // 실종 상태 토글 (No.62)
  const toggleStatus = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, status: (p.status === 'missing' ? 'found' : 'missing') as MissingStatus }
          : p
      )
    )
    // TODO: 상태 변경 API 연동
  }

  // 게시글 삭제 확정 (No.64)
  const confirmDelete = () => {
    if (!deleteTargetId) return
    setPosts((prev) => prev.filter((p) => p.id !== deleteTargetId))
    setDeleteTargetId(null)
    // TODO: 삭제 API 연동
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="뒤로가기">
          <BackIcon />
        </button>
        <h1 className={styles.title}>내 게시글</h1>
        <span />
      </header>

      {posts.length === 0 ? (
        <div className={styles.empty}>
          <p>등록한 실종 신고가 없습니다.</p>
          <button className={styles.reportBtn} onClick={() => navigate('/report')}>
            실종 신고하기
          </button>
        </div>
      ) : (
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.id} className={styles.card}>
              {/* 썸네일 */}
              <div className={styles.thumb}>
                {post.images.length > 0 ? (
                  <img src={post.images[0]} alt={post.petName} className={styles.thumbImg} />
                ) : (
                  <div className={styles.thumbPlaceholder}>🐱</div>
                )}
              </div>

              {/* 게시글 정보 */}
              <div className={styles.info}>
                <div className={styles.topRow}>
                  <span className={styles.petName}>{post.petName}</span>
                  {/* 상태 토글 배지 (No.62) — 클릭 시 실종중 ↔ 찾았어요 전환 */}
                  <button
                    className={[
                      styles.statusBadge,
                      post.status === 'found' ? styles.found : styles.missing,
                    ].join(' ')}
                    onClick={() => toggleStatus(post.id)}
                    title="터치하여 상태 변경"
                  >
                    {post.status === 'missing' ? '실종중' : '찾았어요'}
                  </button>
                </div>
                <span className={styles.species}>{post.species}</span>
                <span className={styles.location}>{post.location.address}</span>
                <span className={styles.reward}>
                  사례금: {post.reward === 0 ? '없음' : `${post.reward.toLocaleString()}원`}
                </span>
              </div>

              {/* 수정/삭제 버튼 (No.63, No.64) */}
              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() => navigate(`/report?edit=${post.id}`)}
                >
                  수정
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => setDeleteTargetId(post.id)}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 삭제 확인 모달 (No.64) */}
      <Modal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        title="게시글 삭제"
      >
        <p className={styles.modalMsg}>정말 이 게시글을 삭제하시겠습니까?</p>
        <ModalActions>
          <button className={styles.cancelBtn} onClick={() => setDeleteTargetId(null)}>취소</button>
          <button className={styles.dangerBtn} onClick={confirmDelete}>삭제</button>
        </ModalActions>
      </Modal>
    </div>
  )
}
