import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal, { ModalActions } from '@/components/Modal/Modal'
import { useAuth } from '@/hooks/useAuth'
import { petsService } from '@/services/pets'
import { toBackendStatus } from '@/utils/transform'
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

  const [posts, setPosts] = useState<MissingPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // 내 게시글 목록 API 조회
  useEffect(() => {
    if (!user?.id) return
    petsService
      .listPets({ userId: user.id })
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setIsLoading(false))
  }, [user?.id])

  // 실종 상태 토글 (No.62) — 낙관적 업데이트
  const toggleStatus = async (postId: string, currentStatus: MissingStatus) => {
    const newStatus: MissingStatus = currentStatus === 'missing' ? 'found' : 'missing'
    // UI 먼저 변경
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p))
    )
    try {
      await petsService.updatePet(postId, { status: toBackendStatus(newStatus) })
    } catch {
      // API 실패 시 롤백
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: currentStatus } : p))
      )
    }
  }

  // 게시글 삭제 확정 (No.64)
  const confirmDelete = async () => {
    if (!deleteTargetId) return
    const targetId = deleteTargetId
    setDeleteTargetId(null)
    setPosts((prev) => prev.filter((p) => p.id !== targetId))
    try {
      await petsService.deletePet(targetId)
    } catch {
      // 삭제 실패 시 목록 다시 불러오기
      if (user?.id) {
        petsService.listPets({ userId: user.id }).then(setPosts).catch(() => {})
      }
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="뒤로가기">
            <BackIcon />
          </button>
          <h1 className={styles.title}>내 게시글</h1>
          <span />
        </header>
        <div style={{ padding: '2rem', textAlign: 'center' }}>불러오는 중...</div>
      </div>
    )
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
                    onClick={() => toggleStatus(post.id, post.status)}
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
