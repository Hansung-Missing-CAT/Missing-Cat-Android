import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { loadKakaoMap, type KakaoMapAPI, type KakaoMarkerAPI } from '@/utils/kakaoMap'
import styles from './KakaoMap.module.css'

export interface MapMarker {
  lat: number
  lng: number
  title?: string       // 인포윈도우 HTML 내용 (없으면 인포윈도우 미표시)
  onClick?: () => void // 마커 클릭 시 콜백
}

interface KakaoMapProps {
  lat?: number
  lng?: number
  level?: number
  markers?: MapMarker[]
  draggable?: boolean
  onClick?: (lat: number, lng: number) => void // 지도 클릭 시 좌표 반환
  style?: CSSProperties
  showCurrentMarker?: boolean // 중심 좌표에 마커 표시
  className?: string
}

const DEFAULT_LAT = 37.5665 // 서울 시청
const DEFAULT_LNG = 126.978
const DEFAULT_LEVEL = 5

export default function KakaoMap({
  lat,
  lng,
  level = DEFAULT_LEVEL,
  markers = [],
  draggable = true,
  onClick,
  style,
  showCurrentMarker = false,
  className,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMapAPI | null>(null)
  const kakaoMarkersRef = useRef<KakaoMarkerAPI[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)

  // onClick을 ref로 관리하여 지도 재초기화 없이 최신 콜백 호출
  const onClickRef = useRef(onClick)
  useEffect(() => {
    onClickRef.current = onClick
  }, [onClick])

  // 최초 1회 지도 초기화
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        await loadKakaoMap()
        if (cancelled || !containerRef.current) return

        const center = new window.kakao.maps.LatLng(lat ?? DEFAULT_LAT, lng ?? DEFAULT_LNG)
        const map: KakaoMapAPI = new window.kakao.maps.Map(containerRef.current, {
          center,
          level,
          draggable,
        })
        mapRef.current = map
        setIsLoaded(true)

        // 지도 클릭 이벤트 — ref를 통해 항상 최신 콜백 호출
        window.kakao.maps.event.addListener(
          map,
          'click',
          (mouseEvent: { latLng: { getLat(): number; getLng(): number } }) => {
            onClickRef.current?.(mouseEvent.latLng.getLat(), mouseEvent.latLng.getLng())
          },
        )
      } catch {
        if (!cancelled) setLoadError(true)
      }
    }

    void init()
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 중심 좌표 변경 시 지도 이동
  useEffect(() => {
    if (!mapRef.current || !isLoaded || lat === undefined || lng === undefined) return
    mapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng))
  }, [lat, lng, isLoaded])

  // 마커 변경 시 기존 마커 제거 후 재생성
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return

    kakaoMarkersRef.current.forEach((m) => m.setMap(null))
    kakaoMarkersRef.current = []

    const allMarkers: MapMarker[] = [...markers]
    if (showCurrentMarker && lat !== undefined && lng !== undefined) {
      allMarkers.push({ lat, lng })
    }

    allMarkers.forEach((data) => {
      const position = new window.kakao.maps.LatLng(data.lat, data.lng)
      const marker: KakaoMarkerAPI = new window.kakao.maps.Marker({
        map: mapRef.current,
        position,
      })

      if (data.title) {
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:13px;max-width:220px;">${data.title}</div>`,
          removable: true,
        })
        window.kakao.maps.event.addListener(marker, 'click', () => {
          infowindow.open(mapRef.current, marker)
          data.onClick?.()
        })
      } else if (data.onClick) {
        window.kakao.maps.event.addListener(marker, 'click', data.onClick)
      }

      kakaoMarkersRef.current.push(marker)
    })
  }, [markers, showCurrentMarker, lat, lng, isLoaded])

  if (loadError) {
    return (
      <div className={`${styles.mapContainer} ${className ?? ''}`} style={style}>
        <div className={styles.placeholder}>
          <span>🗺️</span>
          <p>지도를 불러올 수 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.mapContainer} ${className ?? ''}`}
      style={style}
    />
  )
}
