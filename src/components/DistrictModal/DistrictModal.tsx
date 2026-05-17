import { useLocationStore } from '@/stores/locationStore'
import styles from './DistrictModal.module.css'

// 서울시 25개 구 목록
const SEOUL_DISTRICTS = [
  '전체',
  '강남구', '강동구', '강북구', '강서구', '관악구',
  '광진구', '구로구', '금천구', '노원구', '도봉구',
  '동대문구', '동작구', '마포구', '서대문구', '서초구',
  '성동구', '성북구', '송파구', '양천구', '영등포구',
  '용산구', '은평구', '종로구', '중구', '중랑구',
]

interface DistrictModalProps {
  onClose: () => void
}

// 지역 선택 바텀시트 모달
export default function DistrictModal({ onClose }: DistrictModalProps) {
  const { selectedDistrict, setDistrict } = useLocationStore()

  const handleSelect = (district: string) => {
    setDistrict(district)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <h2 className={styles.title}>지역 선택</h2>
        <p className={styles.subtitle}>서울시 구 단위로 실종 사례를 확인하세요</p>
        <div className={styles.grid}>
          {SEOUL_DISTRICTS.map((district) => (
            <button
              key={district}
              className={`${styles.districtItem} ${selectedDistrict === district ? styles.selected : ''}`}
              onClick={() => handleSelect(district)}
            >
              {district}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
