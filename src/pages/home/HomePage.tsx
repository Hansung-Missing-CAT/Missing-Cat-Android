import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeHeader from '@/components/HomeHeader/HomeHeader'
import DistrictModal from '@/components/DistrictModal/DistrictModal'
import FeedCard from '@/components/FeedCard/FeedCard'
import { FeedListSkeleton } from '@/components/Skeleton/Skeleton'
import ErrorState from '@/components/ErrorState/ErrorState'
import { useNotificationStore } from '@/stores/notificationStore'
import { useLocationStore } from '@/stores/locationStore'
import { MOCK_POSTS, MOCK_NOTIFICATIONS } from '@/utils/mockData'
import type { MissingPost } from '@/types'
import styles from './HomePage.module.css'

type FilterType = 'latest' | 'likes' | 'comments'

const FILTER_LABELS: Record<FilterType, string> = {
  latest: '최신순',
  likes: '좋아요순',
  comments: '댓글순',
}

export default function HomePage() {
  const navigate = useNavigate()
  const [isDistrictModalOpen, setDistrictModalOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('latest')
  const [isMapView, setIsMapView] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { selectedDistrict } = useLocationStore()
  const { setNotifications } = useNotificationStore()

  const loadPosts = () => {
    setIsLoading(true)
    setHasError(false)
    // 목 데이터 로드 시뮬레이션 (실제 API 연동 시 교체)
    setTimeout(() => {
      try {
        setNotifications(MOCK_NOTIFICATIONS)
        setIsLoading(false)
      } catch {
        setHasError(true)
        setIsLoading(false)
      }
    }, 600)
  }

  useEffect(() => {
    loadPosts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 지역 필터링
  const filteredPosts = MOCK_POSTS.filter((post) => {
    if (selectedDistrict === '전체') return true
    return post.location.address.includes(selectedDistrict)
  })

  // 정렬
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (filter === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (filter === 'likes') return b.likeCount - a.likeCount
    return b.commentCount - a.commentCount
  })

  const handleCardClick = (post: MissingPost) => {
    navigate(`/post/${post.id}`)
  }

  const renderContent = () => {
    if (isLoading) return <FeedListSkeleton count={5} />
    if (hasError) return <ErrorState message="게시글을 불러오지 못했어요." onRetry={loadPosts} />
    if (isMapView) {
      return (
        <div className={styles.mapPlaceholder}>
          <p className={styles.mapText}>🗺</p>
          <p>지도 뷰는 카카오맵 API 연동 후 구현됩니다</p>
        </div>
      )
    }
    if (sortedPosts.length === 0) {
      return (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🔍</span>
          <p className={styles.emptyTitle}>{selectedDistrict}에 등록된 실종 사례가 없어요</p>
          <p className={styles.emptyDesc}>다른 지역을 선택해 보세요</p>
        </div>
      )
    }
    return (
      <ul className={styles.feedList}>
        {sortedPosts.map((post) => (
          <li key={post.id}>
            <FeedCard post={post} onClick={() => handleCardClick(post)} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className={styles.page}>
      <HomeHeader onDistrictClick={() => setDistrictModalOpen(true)} />

      <main className={styles.main}>
        {/* 필터 탭 + 지도/목록 전환 */}
        <div className={styles.toolbar}>
          <div className={styles.filterTabs}>
            {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
              <button
                key={f}
                className={`${styles.filterTab} ${filter === f ? styles.activeTab : ''}`}
                onClick={() => setFilter(f)}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
          <button
            className={`${styles.viewToggle} ${isMapView ? styles.activeToggle : ''}`}
            onClick={() => setIsMapView((v) => !v)}
          >
            {isMapView ? '📋 목록' : '🗺 지도'}
          </button>
        </div>

        {renderContent()}
      </main>

      {isDistrictModalOpen && (
        <DistrictModal onClose={() => setDistrictModalOpen(false)} />
      )}
    </div>
  )
}
