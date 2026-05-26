import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeHeader from '@/components/HomeHeader/HomeHeader'
import DistrictModal from '@/components/DistrictModal/DistrictModal'
import FeedCard from '@/components/FeedCard/FeedCard'
import KakaoMap, { type MapMarker } from '@/components/KakaoMap/KakaoMap'
import { FeedListSkeleton } from '@/components/Skeleton/Skeleton'
import ErrorState from '@/components/ErrorState/ErrorState'
import { useLocationStore } from '@/stores/locationStore'
import { petsService } from '@/services/pets'
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
  const [posts, setPosts] = useState<MissingPost[]>([])
  const { selectedDistrict } = useLocationStore()

  const loadPosts = useCallback(async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      const data = await petsService.listPets({
        sort: filter,
        district: selectedDistrict === '전체' ? undefined : selectedDistrict,
      })
      setPosts(data)
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [filter, selectedDistrict])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleCardClick = (post: MissingPost) => {
    navigate(`/post/${post.id}`)
  }

  // 지도 인포윈도우 내 [data-postid] 클릭 시 상세 페이지 이동
  useEffect(() => {
    if (!isMapView) return
    const handleDocClick = (e: MouseEvent) => {
      const el = (e.target as Element).closest('[data-postid]')
      if (el) {
        const postId = el.getAttribute('data-postid')
        if (postId) navigate(`/post/${postId}`)
      }
    }
    document.addEventListener('click', handleDocClick)
    return () => document.removeEventListener('click', handleDocClick)
  }, [isMapView, navigate])

  const renderContent = () => {
    if (isLoading) return <FeedListSkeleton count={5} />
    if (hasError) return <ErrorState message="게시글을 불러오지 못했어요." onRetry={loadPosts} />
    if (isMapView) {
      // 좌표 있는 게시글만 마커로 표시
      const mapMarkers: MapMarker[] = posts
        .filter((p) => p.location.lat !== undefined && p.location.lng !== undefined)
        .map((p) => ({
          lat: p.location.lat!,
          lng: p.location.lng!,
          // 인포윈도우 HTML — data-postid 속성으로 클릭 시 상세 페이지 이동
          title: `
            <div data-postid="${p.id}" style="
              display:flex;align-items:center;gap:8px;
              padding:8px 10px;cursor:pointer;min-width:170px;
            ">
              ${p.images[0]
                ? `<img src="${p.images[0]}" style="width:52px;height:52px;object-fit:cover;border-radius:6px;flex-shrink:0;" />`
                : ''}
              <div>
                <p style="font-weight:700;font-size:13px;margin:0 0 2px;">${p.petName}</p>
                <p style="font-size:12px;color:#666;margin:0;">${p.species}</p>
                <p style="font-size:11px;color:#D32F2F;margin:3px 0 0;">탭하여 상세보기</p>
              </div>
            </div>
          `,
        }))

      return (
        <KakaoMap
          markers={mapMarkers}
          level={7}
          draggable
          className={styles.mapFull}
          style={{ height: 'calc(100vh - 200px)', borderRadius: 0 }}
        />
      )
    }
    if (posts.length === 0) {
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
        {posts.map((post) => (
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
