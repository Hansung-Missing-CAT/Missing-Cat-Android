import { useNavigate } from 'react-router-dom'
import { useChatStore } from '@/stores/chatStore'
import styles from './ChatListPage.module.css'

// 날짜/시간 포맷 유틸
function formatTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  if (isToday) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

export default function ChatListPage() {
  const navigate = useNavigate()
  const { roomSearchQuery, setRoomSearchQuery, getFilteredRooms, getOpponent } = useChatStore()
  const rooms = getFilteredRooms()

  return (
    <div className={styles.container}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>채팅</h1>
      </header>

      {/* 검색창 (No.75) */}
      <div className={styles.searchBox}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="#9e9e9e" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="채팅방 검색"
          value={roomSearchQuery}
          onChange={(e) => setRoomSearchQuery(e.target.value)}
        />
        {roomSearchQuery && (
          <button className={styles.clearBtn} onClick={() => setRoomSearchQuery('')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* 채팅방 목록 (No.74) */}
      <ul className={styles.list}>
        {rooms.length === 0 ? (
          <li className={styles.empty}>
            {roomSearchQuery ? '검색 결과가 없습니다.' : '진행 중인 채팅이 없습니다.'}
          </li>
        ) : (
          rooms.map((room) => {
            const opponent = getOpponent(room.id)
            const initials = opponent?.nickname.slice(0, 1) ?? '?'
            return (
              <li key={room.id}>
                <button
                  className={styles.roomItem}
                  onClick={() => navigate(`/chat/${room.id}`)}
                >
                  {/* 프로필 이미지 */}
                  <div className={styles.avatar}>
                    {opponent?.profileImage ? (
                      <img src={opponent.profileImage} alt={opponent.nickname} className={styles.avatarImg} />
                    ) : (
                      <span className={styles.avatarInitial}>{initials}</span>
                    )}
                    {room.unreadCount > 0 && (
                      <span className={styles.badge}>{room.unreadCount > 99 ? '99+' : room.unreadCount}</span>
                    )}
                  </div>

                  {/* 채팅 내용 */}
                  <div className={styles.content}>
                    <div className={styles.topRow}>
                      <span className={styles.name}>{opponent?.nickname ?? '알 수 없음'}</span>
                      {room.relatedPost && (
                        <span className={styles.speciesTag}>{room.relatedPost.species}</span>
                      )}
                      <span className={styles.time}>
                        {room.updatedAt ? formatTime(room.updatedAt) : ''}
                      </span>
                    </div>
                    <div className={styles.bottomRow}>
                      <span className={styles.lastMsg}>
                        {room.lastMessage?.type === 'image'
                          ? '[사진]'
                          : room.lastMessage?.type === 'location'
                          ? '[위치]'
                          : (room.lastMessage?.content ?? '')}
                      </span>
                    </div>
                    {room.relatedPost && (
                      <div className={styles.postInfo}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#d32f2f" />
                        </svg>
                        <span>{room.relatedPost.location.address}</span>
                        <span className={styles.dot}>·</span>
                        <span>{room.relatedPost.reward.toLocaleString()}원</span>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
