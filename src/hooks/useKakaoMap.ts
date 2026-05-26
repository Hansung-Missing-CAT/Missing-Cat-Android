import { useEffect, useRef, useState } from 'react'
import { loadKakaoMap, type KakaoMapAPI } from '@/utils/kakaoMap'

interface UseKakaoMapOptions {
  lat?: number
  lng?: number
  level?: number
}

const DEFAULT_LAT = 37.5665 // 서울 시청
const DEFAULT_LNG = 126.978
const DEFAULT_LEVEL = 5

// containerId 기반 카카오맵 초기화 훅 (KakaoMap 컴포넌트 외부에서 직접 제어할 때 사용)
export const useKakaoMap = (containerId: string, options?: UseKakaoMapOptions) => {
  const mapRef = useRef<KakaoMapAPI | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        await loadKakaoMap()
        if (cancelled) return

        const container = document.getElementById(containerId)
        if (!container) return

        const center = new window.kakao.maps.LatLng(
          options?.lat ?? DEFAULT_LAT,
          options?.lng ?? DEFAULT_LNG,
        )
        const instance: KakaoMapAPI = new window.kakao.maps.Map(container, {
          center,
          level: options?.level ?? DEFAULT_LEVEL,
        })
        mapRef.current = instance
        setIsLoaded(true)
      } catch {
        // SDK 로드 실패 시 조용히 처리
      }
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [containerId]) // containerId 기준으로 한 번만 초기화

  return { map: mapRef.current, isLoaded }
}
