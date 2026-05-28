import { useEffect } from 'react'
import type { ReportFormData } from '../ReportPage'
import KakaoMap from '@/components/KakaoMap/KakaoMap'
import { loadKakaoMap } from '@/utils/kakaoMap'
import AddressSearch from '@/components/AddressSearch/AddressSearch'
import styles from './Step1Location.module.css'

interface Props {
  form: ReportFormData
  update: (partial: Partial<ReportFormData>) => void
  onNext: () => void
}

// 카카오 Geocoder 응답 최소 타입 (지도 클릭 역지오코딩용)
interface KakaoAddressResult {
  road_address: { address_name: string } | null
  address: { address_name: string }
}

// No.47 지도 기반 위치 선택 + No.48 주소 입력 UI
export default function Step1Location({ form, update, onNext }: Props) {
  const canNext = form.address.trim().length > 0

  // 카카오맵 SDK 미리 로드
  useEffect(() => {
    void loadKakaoMap().catch(() => {})
  }, [])

  // 지도 클릭 → 역지오코딩 → 주소 자동 입력
  const handleMapClick = (lat: number, lng: number) => {
    update({ lat, lng })
    if (!window.kakao?.maps?.services) return
    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.coord2Address(
      lng,
      lat,
      (result: KakaoAddressResult[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const address =
            result[0].road_address?.address_name ?? result[0].address.address_name
          update({ address })
        }
      },
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <h2 className={styles.stepTitle}>실종 위치를 알려주세요</h2>
          <p className={styles.stepDesc}>지도를 탭하거나 주소를 직접 입력하세요</p>
        </div>

        {/* 카카오맵 — 클릭 시 역지오코딩으로 주소 자동 입력 */}
        <KakaoMap
          lat={form.lat}
          lng={form.lng}
          level={4}
          draggable
          onClick={handleMapClick}
          showCurrentMarker={form.lat !== undefined && form.lng !== undefined}
          style={{ height: '240px', marginBottom: 'var(--spacing-4)', borderRadius: '12px' }}
        />

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              주소 <span className={styles.required}>*</span>
            </label>
            {/* AddressSearch: 카카오 Places 검색으로 직접 좌표 반환 */}
            <AddressSearch
              value={form.address}
              onChange={(value) => update({ address: value })}
              onSelect={(address, lat, lng) => update({ address, lat, lng })}
              placeholder="예: 서울시 마포구 합정동"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              상세 주소 <span className={styles.optional}>(선택)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="예: 합정역 2번 출구 근처"
              value={form.detailAddress}
              onChange={(e) => update({ detailAddress: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={[styles.nextBtn, !canNext ? styles.disabled : ''].join(' ')}
          onClick={onNext}
          disabled={!canNext}
        >
          다음
        </button>
      </div>
    </div>
  )
}
