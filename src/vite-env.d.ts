/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// 카카오 Places API 검색 결과 항목 타입
interface KakaoPlace {
  place_name: string
  address_name: string
  road_address_name: string
  x: string  // 경도 (lng)
  y: string  // 위도 (lat)
}

// Google Identity Services (GIS) 전역 타입 선언
declare namespace google.accounts.id {
  interface CredentialResponse {
    credential: string
  }

  interface IdConfiguration {
    client_id: string
    callback: (response: CredentialResponse) => void
    use_fedcm_for_prompt?: boolean
  }

  interface GsiButtonConfiguration {
    theme?: 'outline' | 'filled_blue' | 'filled_black'
    size?: 'large' | 'medium' | 'small'
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
    width?: number
  }

  function initialize(config: IdConfiguration): void
  function prompt(): void
  function renderButton(element: HTMLElement, config: GsiButtonConfiguration): void
}
