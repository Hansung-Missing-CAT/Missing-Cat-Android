import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  clickable?: boolean
}

export default function Card({ children, clickable = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`${styles.card} ${clickable ? styles.clickable : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
