import { Geolocation, Position } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'

export interface GeoCoords {
  latitude: number
  longitude: number
  accuracy: number
}

// 현재 위치 조회 — 제보 시 GPS 자동 태깅용
export async function getCurrentPosition(): Promise<GeoCoords> {
  if (!Capacitor.isNativePlatform()) {
    // 웹 환경 폴백: navigator.geolocation 사용
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 },
      )
    })
  }

  const position: Position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
  })

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  }
}

// 위치 권한 확인 및 요청
export async function checkAndRequestLocationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true

  const status = await Geolocation.checkPermissions()
  if (status.location === 'granted') return true

  const result = await Geolocation.requestPermissions()
  return result.location === 'granted'
}

// 좌표 → 한국 카카오 주소 API 역지오코딩 (추후 API 키 필요)
export function coordsToLabel(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}
