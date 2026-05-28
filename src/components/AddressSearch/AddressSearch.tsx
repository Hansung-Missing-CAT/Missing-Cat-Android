import { useEffect, useRef, useState } from 'react'
import { loadKakaoMap } from '@/utils/kakaoMap'
import styles from './AddressSearch.module.css'

interface AddressSearchProps {
  value: string
  onChange: (value: string) => void
  onSelect: (address: string, lat: number, lng: number) => void
  placeholder?: string
}

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

// 카카오 Places API 키워드 검색 기반 주소 검색 컴포넌트
export default function AddressSearch({ value, onChange, onSelect, placeholder }: AddressSearchProps) {
  const [results, setResults] = useState<KakaoPlace[]>([])
  const [open, setOpen] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 카카오맵 SDK 로드 (서비스 라이브러리 포함)
  useEffect(() => {
    void loadKakaoMap().then(() => setSdkReady(true)).catch(() => {})
  }, [])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 입력 변경 시 300ms 디바운스 후 Places 키워드 검색
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!val.trim()) {
      setResults([])
      setOpen(false)
      return
    }

    // SDK 미로드 시 검색 없이 텍스트 입력만 허용 (graceful degradation)
    if (!sdkReady || !window.kakao?.maps?.services) {
      return
    }

    debounceRef.current = setTimeout(() => {
      const ps = new window.kakao.maps.services.Places()
      ps.keywordSearch(val, (data: KakaoPlace[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setResults(data.slice(0, 5))
          setOpen(true)
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          // 검색 결과 없음 메시지 표시
          setResults([])
          setOpen(true)
        } else {
          setResults([])
          setOpen(false)
        }
      })
    }, 300)
  }

  // 항목 선택 시 주소 + 좌표 전달
  const handleSelect = (place: KakaoPlace) => {
    const address = place.road_address_name || place.address_name
    onChange(address)
    onSelect(address, parseFloat(place.y), parseFloat(place.x))
    setResults([])
    setOpen(false)
  }

  // ESC 키로 드롭다운 닫기
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      setResults([])
    }
  }

  const handleClear = () => {
    onChange('')
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.inputWrapper}>
        <span className={styles.icon}>
          <SearchIcon />
        </span>
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder ?? '주소 또는 장소명 검색'}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        {value && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            aria-label="주소 지우기"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <ul className={styles.dropdown}>
          {results.length === 0 ? (
            <li className={styles.empty}>검색 결과가 없습니다</li>
          ) : (
            results.map((place, i) => (
              <li
                key={i}
                className={styles.item}
                // onMouseDown — onClick 대신 사용해야 input blur보다 먼저 실행됨
                onMouseDown={() => handleSelect(place)}
              >
                <span className={styles.placeName}>{place.place_name}</span>
                <span className={styles.placeAddr}>
                  {place.road_address_name || place.address_name}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
