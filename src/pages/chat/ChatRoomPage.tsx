import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'
import { chatsService } from '@/services/chats'
import { socketService } from '@/services/socket'
import ReportModal from './components/ReportModal'
import LeaveModal from './components/LeaveModal'
import LocationPickerModal from './components/LocationPickerModal'
import styles from './ChatRoomPage.module.css'

// 날짜 구분선 포맷
function formatDateDivider(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

// 말풍선 시간 포맷
function formatBubbleTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const myId = user?.id ?? ''
  const {
    setCurrentRoom,
    markAsRead,
    sendMessage,
    setMessages,
    getFilteredMessages,
    getCurrentRoom,
    getOpponent,
    addOrUpdateRoom,
    searchQuery,
    setSearchQuery,
    reportModalOpen,
    leaveModalOpen,
    openReportModal,
    closeReportModal,
    openLeaveModal,
    closeLeaveModal,
    leaveRoom,
  } = useChatStore()

  // 상대방 이름 재조회 결과 — other_user_name이 null이면 API 재조회로 갱신
  const [refreshedOpponentName, setRefreshedOpponentName] = useState<string | null>(null)

  // sendTip 직후 navigate 시 스토어에 방이 없을 수 있으므로 API로 로드 중 여부
  const [isRoomLoading, setIsRoomLoading] = useState(() => {
    if (!roomId) return false
    return !useChatStore.getState().rooms.some((r) => r.id === roomId)
  })

  const [text, setText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [attachOpen, setAttachOpen] = useState(false)
  const [msgSearchMode, setMsgSearchMode] = useState(false)
  const [locationPickerOpen, setLocationPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const messages = roomId ? getFilteredMessages(roomId) : []
  const room = roomId ? getCurrentRoom() : undefined
  const opponent = roomId ? getOpponent(roomId) : undefined

  // 메시지 로드 + 소켓 채팅방 참가
  useEffect(() => {
    if (!roomId) return
    setCurrentRoom(roomId)

    // 메시지 목록 API 로드
    void chatsService.getMessages(roomId).then((msgs) => {
      setMessages(roomId, msgs)
    })

    // 읽음 처리 (API + 로컬 상태)
    void chatsService.markAsRead(roomId)
    markAsRead(roomId)

    // 소켓 채팅방 참가
    socketService.joinChat(roomId)

    // 상대방 메시지 실시간 수신
    socketService.onNewMessage(({ chatId, message }) => {
      if (chatId !== roomId) return
      // 서버에서 전체 메시지 목록을 다시 불러와 동기화
      void chatsService.getMessages(chatId).then((msgs) => {
        setMessages(chatId, msgs)
        void chatsService.markAsRead(chatId)
        markAsRead(chatId)
      })
      void message // 미사용 변수 경고 억제
    })

    return () => {
      socketService.leaveChat(roomId)
      socketService.off('message.new')
      setCurrentRoom(null)
    }
  }, [roomId, setCurrentRoom, setMessages, markAsRead])

  // 새 메시지 수신 시 하단 스크롤
  useEffect(() => {
    if (!msgSearchMode) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, msgSearchMode])

  // 스토어에 채팅방이 없으면 API로 가져와 추가 (sendTip 후 직접 navigate 시 발생)
  const loadRoomFromApi = useCallback(() => {
    if (!roomId) { setIsRoomLoading(false); return }
    void chatsService.getChat(roomId)
      .then((fetchedRoom) => { addOrUpdateRoom(fetchedRoom) })
      .catch(() => {})
      .finally(() => { setIsRoomLoading(false) })
  }, [roomId, addOrUpdateRoom])

  useEffect(() => {
    if (!isRoomLoading) return
    loadRoomFromApi()
  }, [isRoomLoading, loadRoomFromApi])

  // 상대방 이름이 불명확하면 채팅방 API 재조회해서 이름 갱신
  useEffect(() => {
    const name = opponent?.nickname
    if (!roomId || (name && name !== '상대방' && name !== '알 수 없음')) return
    void chatsService.getChat(roomId).then((updatedRoom) => {
      const other = updatedRoom.participants.find((p) => p.id !== myId)
      if (other?.nickname && other.nickname !== '상대방') {
        setRefreshedOpponentName(other.nickname)
      }
    }).catch(() => {})
  }, [roomId, opponent?.nickname, myId])

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  function handleSend() {
    if (!roomId || !text.trim()) return
    const content = text.trim()
    setText('')
    // 낙관적 업데이트 후 API 전송
    sendMessage(roomId, content)
    void chatsService.sendMessage(roomId, content)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 이미지 첨부 (No.79, 80)
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !roomId) return
    const url = URL.createObjectURL(file)
    sendMessage(roomId, '[사진]', 'image', { imageUrl: url })
    setAttachOpen(false)
    e.target.value = ''
  }

  // 전화 걸기 (No.82)
  function handleCall() {
    if (opponent?.phone) {
      window.location.href = `tel:${opponent.phone}`
    }
  }

  // 장소 공유 전송 (No.81)
  function handleLocationSend(address: string) {
    if (!roomId) return
    sendMessage(roomId, address, 'location', {
      location: { address },
    })
    setLocationPickerOpen(false)
  }

  // 채팅방 나가기 확정 (No.85)
  function handleLeaveConfirm() {
    if (roomId) {
      leaveRoom(roomId)
      void chatsService.leaveChat(roomId)
    }
    closeLeaveModal()
    navigate('/chat')
  }

  if (isRoomLoading) {
    return (
      <div className={styles.notFound}>
        <p>채팅방을 불러오는 중...</p>
      </div>
    )
  }

  if (!room) {
    return (
      <div className={styles.notFound}>
        <p>채팅방을 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/chat')} className={styles.backBtn} style={{ whiteSpace: 'nowrap' }}>
          목록으로
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* 상단 바 (No.76) */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/chat')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className={styles.headerInfo}>
          <span className={styles.opponentName}>
            {refreshedOpponentName ?? opponent?.nickname ?? '알 수 없음'}
          </span>
          {/* pet_name이 있으면 관련 게시글 컨텍스트 표시 */}
          {room.relatedPost?.petName && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {room.relatedPost.petName} 관련 대화
            </span>
          )}
          {room.relatedPost && (
            <div className={styles.postMeta}>
              {/* species가 빈 문자열이면 태그 숨김 */}
              {room.relatedPost.species && (
                <>
                  <span className={styles.speciesTag}>{room.relatedPost.species}</span>
                  <span className={styles.metaDivider}>·</span>
                </>
              )}
              <span>{room.relatedPost.location.address}</span>
              {/* reward가 0이면 사례금 영역 숨김 */}
              {room.relatedPost.reward > 0 && (
                <>
                  <span className={styles.metaDivider}>·</span>
                  <span>{room.relatedPost.reward.toLocaleString()}원</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className={styles.headerActions}>
          {/* 대화 내용 검색 (No.83) */}
          <button
            className={styles.iconBtn}
            onClick={() => {
              setMsgSearchMode((v) => !v)
              if (msgSearchMode) setSearchQuery('')
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* 전화 걸기 (No.82) */}
          <button className={styles.iconBtn} onClick={handleCall}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* 더보기 메뉴 */}
          <div className={styles.menuWrapper} ref={menuRef}>
            <button className={styles.iconBtn} onClick={() => setMenuOpen((v) => !v)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {menuOpen && (
              <ul className={styles.menu}>
                {/* 신고하기 (No.84) */}
                <li>
                  <button
                    className={styles.menuItem}
                    onClick={() => { openReportModal(); setMenuOpen(false) }}
                  >
                    신고하기
                  </button>
                </li>
                {/* 채팅방 나가기 (No.85) */}
                <li>
                  <button
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                    onClick={() => { openLeaveModal(); setMenuOpen(false) }}
                  >
                    채팅방 나가기
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* 메시지 내 검색 바 (No.83) */}
      {msgSearchMode && (
        <div className={styles.msgSearchBar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#9e9e9e" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            className={styles.msgSearchInput}
            type="text"
            placeholder="대화 내용 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* 메시지 목록 (No.77) */}
      <main className={styles.messages}>
        {messages.length === 0 && searchQuery ? (
          <div className={styles.emptySearch}>검색 결과가 없습니다.</div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.senderId === myId
            const prevMsg = messages[idx - 1]
            const showDivider = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt)

            return (
              <div key={msg.id}>
                {/* 날짜 구분선 */}
                {showDivider && (
                  <div className={styles.dateDivider}>
                    <span>{formatDateDivider(msg.createdAt)}</span>
                  </div>
                )}

                {/* 말풍선 */}
                <div className={`${styles.msgRow} ${isMine ? styles.mine : styles.theirs}`}>
                  {!isMine && (
                    <div className={styles.opponentAvatar}>
                      {opponent?.profileImage ? (
                        <img src={opponent.profileImage} alt={opponent.nickname} className={styles.avatarImg} />
                      ) : (
                        <span className={styles.avatarInitial}>{opponent?.nickname.slice(0, 1) ?? '?'}</span>
                      )}
                    </div>
                  )}

                  <div className={styles.bubbleGroup}>
                    {!isMine && (
                      <span className={styles.senderName}>{opponent?.nickname}</span>
                    )}
                    <div className={styles.bubbleRow}>
                      {isMine && (
                        <span className={styles.readStatus}>{msg.isRead ? '' : '1'}</span>
                      )}
                      <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleTheirs}`}>
                        {msg.type === 'image' && msg.imageUrl ? (
                          <img src={msg.imageUrl} alt="첨부 이미지" className={styles.msgImage} />
                        ) : msg.type === 'location' ? (
                          <div className={styles.locationMsg}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            <span>{msg.content}</span>
                          </div>
                        ) : (
                          <span>{msg.content}</span>
                        )}
                      </div>
                      {!isMine && (
                        <span className={styles.readStatus}>{msg.isRead ? '' : '1'}</span>
                      )}
                    </div>
                    <span className={`${styles.msgTime} ${isMine ? styles.msgTimeRight : styles.msgTimeLeft}`}>
                      {formatBubbleTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </main>

      {/* 입력창 (No.78) */}
      <footer className={styles.inputArea}>
        {/* 첨부 버튼 (No.79) */}
        <div className={styles.attachWrapper}>
          <button
            className={styles.attachBtn}
            onClick={() => setAttachOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
            </svg>
          </button>
          {attachOpen && (
            <ul className={styles.attachMenu}>
              <li>
                <button
                  className={styles.attachMenuItem}
                  onClick={() => { fileInputRef.current?.click(); setAttachOpen(false) }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  앨범
                </button>
              </li>
              <li>
                <button
                  className={styles.attachMenuItem}
                  onClick={() => { fileInputRef.current?.click(); setAttachOpen(false) }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5zm7-9l-1.5-1.5c-.6-.6-1.5-.6-2.1 0L14 6.5H5C3.9 6.5 3 7.4 3 8.5v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2h-1.5z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  카메라
                </button>
              </li>
              <li>
                <button
                  className={styles.attachMenuItem}
                  onClick={() => { setLocationPickerOpen(true); setAttachOpen(false) }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  장소 공유
                </button>
              </li>
            </ul>
          )}
        </div>

        <input
          className={styles.textInput}
          type="text"
          placeholder="메시지를 입력하세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          className={`${styles.sendBtn} ${text.trim() ? styles.sendBtnActive : ''}`}
          onClick={handleSend}
          disabled={!text.trim()}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor" />
          </svg>
        </button>

        {/* 숨겨진 파일 입력 (No.80) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </footer>

      {/* 신고 모달 (No.84) */}
      {reportModalOpen && (
        <ReportModal
          onClose={closeReportModal}
          onSubmit={async (reason) => {
            if (roomId) await chatsService.reportChat(roomId, reason)
          }}
        />
      )}

      {/* 나가기 모달 (No.85) */}
      {leaveModalOpen && (
        <LeaveModal
          opponentName={opponent?.nickname ?? '상대방'}
          onClose={closeLeaveModal}
          onConfirm={handleLeaveConfirm}
        />
      )}

      {/* 장소 공유 모달 (No.81) */}
      {locationPickerOpen && (
        <LocationPickerModal
          onClose={() => setLocationPickerOpen(false)}
          onSend={handleLocationSend}
        />
      )}
    </div>
  )
}
