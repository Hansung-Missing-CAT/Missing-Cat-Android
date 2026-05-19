import styles from './ErrorState.module.css'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

// API 에러 / 빈 결과 공통 UI
export default function ErrorState({
  message = '데이터를 불러오지 못했어요.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.wrapper} role="alert">
      <span className={styles.icon}>⚠️</span>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  )
}
