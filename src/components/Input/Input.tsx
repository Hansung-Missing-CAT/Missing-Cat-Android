import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  errorMessage?: string
  rightElement?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, errorMessage, rightElement, className = '', ...rest }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            className={`${styles.input} ${errorMessage ? styles.error : ''} ${rightElement ? styles.hasRight : ''} ${className}`}
            {...rest}
          />
          {rightElement && <div className={styles.rightElement}>{rightElement}</div>}
        </div>
        {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
