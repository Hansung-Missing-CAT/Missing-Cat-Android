import { useState } from 'react'
import styles from './Modal.module.css'

const SAMPLE_LOCATIONS = [
  '서울 성북구 정릉동 123-4',
  '서울 노원구 월계동 56-7',
  '서울 강북구 수유동 89-1',
  '서울 도봉구 창동 12-3',
]

interface Props {
  onClose: () => void
  onSend: (address: string) => void
}

// 장소 공유 모달 (No.81) — 실제 지도 연동은 Phase 7에서 카카오맵 SDK 연동 시 교체
export default function LocationPickerModal({ onClose, onSend }: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = query.trim()
    ? SAMPLE_LOCATIONS.filter((l) => l.includes(query))
    : SAMPLE_LOCATIONS

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <h2 className={styles.title}>장소 공유</h2>

        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#9e9e9e" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            className={styles.searchInput}
            type="text"
            placeholder="장소명 또는 주소 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* 지도 플레이스홀더 — Phase 7에서 카카오맵으로 교체 */}
        <div className={styles.mapPlaceholder}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#d32f2f" opacity="0.3" />
          </svg>
          <span>지도 (Phase 7에서 카카오맵 연동)</span>
        </div>

        <ul className={styles.locationList}>
          {filtered.map((loc) => (
            <li key={loc}>
              <button
                className={`${styles.locationItem} ${selected === loc ? styles.selected : ''}`}
                onClick={() => setSelected(loc)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#d32f2f" />
                </svg>
                <span>{loc}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
          <button
            className={`${styles.primaryBtn} ${!selected ? styles.disabled : ''}`}
            disabled={!selected}
            onClick={() => selected && onSend(selected)}
          >
            이 위치 공유
          </button>
        </div>
      </div>
    </div>
  )
}
