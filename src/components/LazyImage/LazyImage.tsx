import { useState } from 'react'
import styles from './LazyImage.module.css'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
}

// 브라우저 네이티브 lazy loading + 에러 시 fallback 표시
export default function LazyImage({ src, alt, className, fallback }: LazyImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return <>{fallback ?? <div className={styles.placeholder} aria-hidden="true" />}</>
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setError(true)}
    />
  )
}
