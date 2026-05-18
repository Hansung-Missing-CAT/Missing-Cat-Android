import { useState } from 'react'
import styles from './Modal.module.css'

const REPORT_REASONS = [
  '욕설·비방',
  '개인정보 요구',
  '사기 의심',
  '스팸·도배',
  '기타',
]

interface Props {
  onClose: () => void
}

// 신고하기 모달 (No.84)
export default function ReportModal({ onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit() {
    if (!selected) return
    setSubmitted(true)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <h2 className={styles.title}>신고하기</h2>

        {submitted ? (
          <div className={styles.successMsg}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#388e3c" />
              <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p>신고가 접수되었습니다.</p>
            <button className={styles.primaryBtn} onClick={onClose}>확인</button>
          </div>
        ) : (
          <>
            <p className={styles.desc}>신고 사유를 선택해주세요.</p>
            <ul className={styles.reasonList}>
              {REPORT_REASONS.map((reason) => (
                <li key={reason}>
                  <button
                    className={`${styles.reasonItem} ${selected === reason ? styles.selected : ''}`}
                    onClick={() => setSelected(reason)}
                  >
                    <span>{reason}</span>
                    {selected === reason && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5L20 7" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>취소</button>
              <button
                className={`${styles.primaryBtn} ${!selected ? styles.disabled : ''}`}
                disabled={!selected}
                onClick={handleSubmit}
              >
                신고 제출
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
