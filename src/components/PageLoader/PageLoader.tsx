import styles from './PageLoader.module.css'

// React.lazy Suspense fallback — 페이지 전환 시 표시되는 전체 화면 로더
export default function PageLoader() {
  return (
    <div className={styles.wrapper} role="status" aria-label="페이지 로딩 중">
      <div className={styles.spinner} />
    </div>
  )
}
