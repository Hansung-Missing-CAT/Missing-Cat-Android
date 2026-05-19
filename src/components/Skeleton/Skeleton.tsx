import styles from './Skeleton.module.css'

interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  className?: string
}

// 단일 스켈레톤 블록
export function Skeleton({ width = '100%', height = '16px', borderRadius = '4px', className }: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className ?? ''}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  )
}

// 피드 카드 스켈레톤 (FeedCard와 동일한 레이아웃)
export function FeedCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.imageArea} />
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <Skeleton width="80px" height="18px" />
          <Skeleton width="40px" height="14px" />
        </div>
        <Skeleton width="120px" height="14px" />
        <div className={styles.bottomRow}>
          <Skeleton width="90px" height="13px" />
          <Skeleton width="50px" height="13px" />
        </div>
      </div>
    </div>
  )
}

// 피드 목록 스켈레톤 (n개 카드)
export function FeedListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className={styles.list} aria-label="로딩 중">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <FeedCardSkeleton />
        </li>
      ))}
    </ul>
  )
}
