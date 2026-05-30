// 카카오맵 외부 SDK 타입 선언 (window.kakao에 한해 any 허용)
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any
  }
}

// 외부 SDK 연동을 위한 최소 인터페이스 — 타입 안전성 확보
export interface KakaoLatLng {
  getLat(): number
  getLng(): number
}

export interface KakaoMapAPI {
  setCenter(latlng: KakaoLatLng): void
}

export interface KakaoMarkerAPI {
  setMap(map: KakaoMapAPI | null): void
}

// 로드 Promise를 모듈 수준에서 캐싱하여 중복 스크립트 삽입 방지
let loadPromise: Promise<void> | null = null

// 카카오맵 SDK를 동적으로 로드하고 초기화 (이미 로드되었으면 스킵)
export const loadKakaoMap = (): Promise<void> => {
  if (loadPromise) return loadPromise

  loadPromise = new Promise<void>((resolve, reject) => {
    // SDK 및 maps 객체가 이미 존재하면 바로 초기화
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve())
      return
    }

    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY as string
    if (!apiKey) {
      reject(new Error('VITE_KAKAO_MAP_API_KEY가 설정되지 않았습니다'))
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    // https:// 명시 — androidScheme='http' 환경에서 //는 http:로 해석되어 Kakao CDN 로드 실패
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => resolve())
    }
    script.onerror = () => {
      loadPromise = null // 실패 시 재시도 가능하도록 초기화
      reject(new Error('카카오맵 SDK 로드 실패'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}
