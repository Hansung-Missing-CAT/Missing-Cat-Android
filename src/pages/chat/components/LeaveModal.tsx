import styles from './Modal.module.css'

interface Props {
  opponentName: string
  onClose: () => void
  onConfirm: () => void
}

// 채팅방 나가기 확인 모달 (No.85)
export default function LeaveModal({ opponentName, onClose, onConfirm }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>채팅방 나가기</h2>
        <p className={styles.desc}>
          {opponentName}님과의 채팅방을 나가시겠습니까?
          <br />
          대화 내용이 모두 삭제됩니다.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
          <button className={`${styles.primaryBtn} ${styles.danger}`} onClick={onConfirm}>
            나가기
          </button>
        </div>
      </div>
    </div>
  )
}
