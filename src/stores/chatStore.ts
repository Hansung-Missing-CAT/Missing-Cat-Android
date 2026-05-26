import { create } from 'zustand'
import type { ChatRoom, ChatMessage, User } from '@/types'

// 현재 로그인 유저 ID를 Zustand persist 저장소에서 읽기
const getMyId = (): string => {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return ''
    const parsed = JSON.parse(raw) as { state?: { user?: { id?: string } } }
    return parsed?.state?.user?.id ?? ''
  } catch {
    return ''
  }
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
  rooms: [],
  messages: {},
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
    const myId = getMyId()
    if (!roomSearchQuery.trim()) return rooms
    const q = roomSearchQuery.toLowerCase()
    return rooms.filter(
      (r) =>
        r.participants.some((p) => p.id !== myId && p.nickname.toLowerCase().includes(q)) ||
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
    const myId = getMyId()
    const room = rooms.find((r) => r.id === roomId)
    return room?.participants.find((p) => p.id !== myId)
  },
}))
