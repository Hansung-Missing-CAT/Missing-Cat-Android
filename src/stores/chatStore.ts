import { create } from 'zustand'
import type { ChatRoom, ChatMessage, User } from '@/types'

// 목 데이터 — 실제 서비스에서는 API로 대체 (하위 호환 유지)
const MOCK_ME: User = {
  id: 'me',
  email: 'me@example.com',
  nickname: '나',
  profileImage: undefined,
}

// 현재 로그인 유저 ID를 Zustand persist 저장소에서 읽기
const getMyId = (): string => {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return MOCK_ME.id
    const parsed = JSON.parse(raw) as { state?: { user?: { id?: string } } }
    return parsed?.state?.user?.id ?? MOCK_ME.id
  } catch {
    return MOCK_ME.id
  }
}

const MOCK_ROOMS: ChatRoom[] = [
  {
    id: 'room-1',
    participants: [
      MOCK_ME,
      { id: 'user-2', email: 'kim@example.com', nickname: '김민준', phone: '010-1234-5678' },
    ],
    relatedPost: {
      id: 'post-1',
      userId: 'user-2',
      authorNickname: '김민준',
      petName: '나비',
      species: '코리안숏헤어',
      location: { address: '서울 성북구 정릉동' },
      lostAt: '2026-05-10T10:00:00Z',
      lostTimezone: 'morning',
      reward: 100000,
      status: 'missing',
      images: [],
      likeCount: 5,
      commentCount: 2,
      createdAt: '2026-05-10T10:00:00Z',
      updatedAt: '2026-05-10T10:00:00Z',
    },
    lastMessage: {
      id: 'msg-last-1',
      chatRoomId: 'room-1',
      senderId: 'user-2',
      content: '혹시 이 근처에서 보신 거 맞나요?',
      type: 'text',
      isRead: false,
      createdAt: '2026-05-18T09:30:00Z',
    },
    unreadCount: 2,
    updatedAt: '2026-05-18T09:30:00Z',
  },
  {
    id: 'room-2',
    participants: [
      MOCK_ME,
      { id: 'user-3', email: 'park@example.com', nickname: '박서연', phone: '010-9876-5432' },
    ],
    relatedPost: {
      id: 'post-2',
      userId: 'user-3',
      authorNickname: '박서연',
      petName: '까만이',
      species: '러시안블루',
      location: { address: '서울 노원구 월계동' },
      lostAt: '2026-05-15T14:00:00Z',
      lostTimezone: 'afternoon',
      reward: 50000,
      status: 'missing',
      images: [],
      likeCount: 3,
      commentCount: 1,
      createdAt: '2026-05-15T14:00:00Z',
      updatedAt: '2026-05-15T14:00:00Z',
    },
    lastMessage: {
      id: 'msg-last-2',
      chatRoomId: 'room-2',
      senderId: 'me',
      content: '제가 찍은 사진 보내드릴게요.',
      type: 'text',
      isRead: true,
      createdAt: '2026-05-17T16:00:00Z',
    },
    unreadCount: 0,
    updatedAt: '2026-05-17T16:00:00Z',
  },
]

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  'room-1': [
    {
      id: 'msg-1',
      chatRoomId: 'room-1',
      senderId: 'user-2',
      content: '안녕하세요! 저희 고양이 나비를 보셨나요?',
      type: 'text',
      isRead: true,
      createdAt: '2026-05-18T09:00:00Z',
    },
    {
      id: 'msg-2',
      chatRoomId: 'room-1',
      senderId: 'me',
      content: '네, 정릉동 쪽에서 봤어요. 회색 줄무늬 고양이 맞죠?',
      type: 'text',
      isRead: true,
      createdAt: '2026-05-18T09:10:00Z',
    },
    {
      id: 'msg-3',
      chatRoomId: 'room-1',
      senderId: 'user-2',
      content: '맞아요! 혹시 이 근처에서 보신 거 맞나요?',
      type: 'text',
      isRead: false,
      createdAt: '2026-05-18T09:30:00Z',
    },
  ],
  'room-2': [
    {
      id: 'msg-4',
      chatRoomId: 'room-2',
      senderId: 'user-3',
      content: '제보 감사합니다. 어디서 발견하셨나요?',
      type: 'text',
      isRead: true,
      createdAt: '2026-05-17T15:00:00Z',
    },
    {
      id: 'msg-5',
      chatRoomId: 'room-2',
      senderId: 'me',
      content: '제가 찍은 사진 보내드릴게요.',
      type: 'text',
      isRead: true,
      createdAt: '2026-05-17T16:00:00Z',
    },
  ],
}

interface ChatState {
  rooms: ChatRoom[]
  messages: Record<string, ChatMessage[]>
  currentRoomId: string | null
  searchQuery: string
  roomSearchQuery: string
  // 신고 모달 / 나가기 모달
  reportModalOpen: boolean
  leaveModalOpen: boolean

  setCurrentRoom: (roomId: string | null) => void
  setSearchQuery: (q: string) => void
  setRoomSearchQuery: (q: string) => void
  setRooms: (rooms: ChatRoom[]) => void
  setMessages: (roomId: string, messages: ChatMessage[]) => void
  sendMessage: (roomId: string, content: string, type?: ChatMessage['type'], extra?: Partial<ChatMessage>) => void
  markAsRead: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  openReportModal: () => void
  closeReportModal: () => void
  openLeaveModal: () => void
  closeLeaveModal: () => void
  getFilteredRooms: () => ChatRoom[]
  getFilteredMessages: (roomId: string) => ChatMessage[]
  getCurrentRoom: () => ChatRoom | undefined
  getOpponent: (roomId: string) => User | undefined
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: MOCK_ROOMS,
  messages: MOCK_MESSAGES,
  currentRoomId: null,
  searchQuery: '',
  roomSearchQuery: '',
  reportModalOpen: false,
  leaveModalOpen: false,

  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  setRoomSearchQuery: (q) => set({ roomSearchQuery: q }),

  // API에서 받아온 채팅방 목록으로 교체
  setRooms: (rooms) => set({ rooms }),

  // API에서 받아온 메시지 목록으로 교체
  setMessages: (roomId, messages) =>
    set((state) => ({ messages: { ...state.messages, [roomId]: messages } })),

  sendMessage: (roomId, content, type = 'text', extra = {}) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatRoomId: roomId,
      senderId: getMyId(),  // 실제 사용자 ID 사용
      content,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
      ...extra,
    }
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] ?? []), newMsg],
      },
      rooms: state.rooms.map((r) =>
        r.id === roomId ? { ...r, lastMessage: newMsg, updatedAt: newMsg.createdAt } : r,
      ),
    }))
  },

  markAsRead: (roomId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: (state.messages[roomId] ?? []).map((m) => ({ ...m, isRead: true })),
      },
      rooms: state.rooms.map((r) => (r.id === roomId ? { ...r, unreadCount: 0 } : r)),
    }))
  },

  leaveRoom: (roomId) => {
    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== roomId),
      currentRoomId: state.currentRoomId === roomId ? null : state.currentRoomId,
    }))
  },

  openReportModal: () => set({ reportModalOpen: true }),
  closeReportModal: () => set({ reportModalOpen: false }),
  openLeaveModal: () => set({ leaveModalOpen: true }),
  closeLeaveModal: () => set({ leaveModalOpen: false }),

  getFilteredRooms: () => {
    const { rooms, roomSearchQuery } = get()
    if (!roomSearchQuery.trim()) return rooms
    const q = roomSearchQuery.toLowerCase()
    return rooms.filter(
      (r) =>
        r.participants.some((p) => p.id !== 'me' && p.nickname.toLowerCase().includes(q)) ||
        r.relatedPost?.petName.toLowerCase().includes(q) ||
        r.lastMessage?.content.toLowerCase().includes(q),
    )
  },

  getFilteredMessages: (roomId) => {
    const { messages, searchQuery } = get()
    const msgs = messages[roomId] ?? []
    if (!searchQuery.trim()) return msgs
    const q = searchQuery.toLowerCase()
    return msgs.filter((m) => m.content.toLowerCase().includes(q))
  },

  getCurrentRoom: () => {
    const { rooms, currentRoomId } = get()
    return rooms.find((r) => r.id === currentRoomId)
  },

  getOpponent: (roomId) => {
    const { rooms } = get()
    const room = rooms.find((r) => r.id === roomId)
    return room?.participants.find((p) => p.id !== 'me')
  },
}))

export { MOCK_ME }
