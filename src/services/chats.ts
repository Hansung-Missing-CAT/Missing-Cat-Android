import apiClient from './api'
import type { ChatRoom, ChatMessage, User, MissingPost } from '@/types'

// 페이지네이션 래핑 응답 타입 (배열 또는 { data, nextCursor, hasMore })
interface PaginatedChatRoomResponse {
  data: BackendChatRoom[]
  nextCursor?: string
  hasMore?: boolean
}

interface PaginatedChatMessageResponse {
  data: BackendChatMessage[]
  nextCursor?: string
  hasMore?: boolean
}

// 배열 또는 래핑 응답에서 BackendChatRoom[] 추출
const extractChatRooms = (raw: BackendChatRoom[] | PaginatedChatRoomResponse): BackendChatRoom[] => {
  if (Array.isArray(raw)) return raw
  return raw.data ?? []
}

// 배열 또는 래핑 응답에서 BackendChatMessage[] 추출
const extractChatMessages = (raw: BackendChatMessage[] | PaginatedChatMessageResponse): BackendChatMessage[] => {
  if (Array.isArray(raw)) return raw
  return raw.data ?? []
}

// 백엔드 채팅방 응답 타입 (snake_case)
interface BackendChatRoom {
  id: string
  pet_id?: string
  pet_name?: string
  pet_photo?: string
  // 백엔드 JOIN 결과 — 없으면 participant_ids 배열로 fallback
  other_user_id?: string
  other_user_name?: string
  other_user_avatar?: string
  participant_ids?: string[]   // DB 실제 컬럼 (JOIN 미포함 시)
  is_online?: boolean
  last_message?: string
  last_message_type?: ChatMessage['type']
  last_message_at?: string
  unread_count: number
  created_at: string
  updated_at: string
}

// 백엔드 메시지 응답 타입 (snake_case) — DB 컬럼명 기준
export interface BackendChatMessage {
  id: string
  sender_id: string
  message: string    // DB 컬럼명: message (content 아님)
  type: ChatMessage['type']
  image_url?: string
  location?: { lat?: number; lng?: number; address?: string }
  read_by: string[]  // 읽은 사용자 UUID 배열
  created_at: string
}

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

// 백엔드 채팅방 → 프론트 ChatRoom 변환
const toFrontendChatRoom = (b: BackendChatRoom): ChatRoom => {
  const myId = getMyId()
  const me: User = { id: myId, email: '', nickname: '나' }

  // JOIN 결과(other_user_id)가 있으면 우선 사용, 없으면 participant_ids에서 상대방 추출
  let otherUser: User
  if (b.other_user_id) {
    otherUser = {
      id: b.other_user_id,
      email: '',
      nickname: b.other_user_name ?? '상대방',
      profileImage: b.other_user_avatar,
    }
  } else {
    const otherId = b.participant_ids?.find((pid) => pid !== myId) ?? ''
    otherUser = { id: otherId, email: '', nickname: '상대방' }
  }

  const lastMessage: ChatMessage | undefined = b.last_message
    ? {
        id: `last-${b.id}`,
        chatRoomId: b.id,
        senderId: '',
        content: b.last_message,
        type: b.last_message_type ?? 'text',
        isRead: b.unread_count === 0,
        createdAt: b.last_message_at ?? b.updated_at,
      }
    : undefined

  // 백엔드 채팅방은 pet 정보 일부만 제공하므로 필수 필드만 채움
  const relatedPost: MissingPost | undefined = b.pet_id
    ? {
        id: b.pet_id,
        userId: '',
        authorNickname: '',
        petName: b.pet_name ?? '',
        species: '',
        location: { address: '' },
        lostAt: '',
        lostTimezone: 'morning',
        reward: 0,
        status: 'missing',
        images: b.pet_photo ? [b.pet_photo] : [],
        likeCount: 0,
        commentCount: 0,
        createdAt: '',
        updatedAt: '',
      }
    : undefined

  return {
    id: b.id,
    participants: [me, otherUser],
    relatedPost,
    lastMessage,
    unreadCount: b.unread_count,
    updatedAt: b.updated_at,
  }
}

// 백엔드 메시지 → 프론트 ChatMessage 변환
export const toFrontendChatMessage = (b: BackendChatMessage, chatId: string): ChatMessage => {
  const myId = getMyId()
  return {
    id: b.id,
    chatRoomId: chatId,
    senderId: b.sender_id,
    content: b.message,  // DB 컬럼명 message → 프론트 content
    type: b.type,
    imageUrl: b.image_url,
    location: b.location
      ? { address: b.location.address ?? '', lat: b.location.lat, lng: b.location.lng }
      : undefined,
    isRead: b.read_by.includes(myId),
    createdAt: b.created_at,
  }
}

export const chatsService = {
  // 채팅방 목록 조회 — 배열 또는 { data, nextCursor, hasMore } 래핑 응답 모두 처리
  getChatList: async (params?: { q?: string; limit?: number }): Promise<ChatRoom[]> => {
    const res = await apiClient.get<BackendChatRoom[] | PaginatedChatRoomResponse>('/chats', { params })
    return extractChatRooms(res.data).map(toFrontendChatRoom)
  },

  // 채팅방 상세 조회
  getChat: async (chatId: string): Promise<ChatRoom> => {
    const res = await apiClient.get<BackendChatRoom>(`/chats/${chatId}`)
    return toFrontendChatRoom(res.data)
  },

  // 메시지 목록 조회 — 배열 또는 { data, nextCursor, hasMore } 래핑 응답 모두 처리
  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const res = await apiClient.get<BackendChatMessage[] | PaginatedChatMessageResponse>(`/chats/${chatId}/messages`)
    return extractChatMessages(res.data).map((m) => toFrontendChatMessage(m, chatId))
  },

  // 메시지 전송
  sendMessage: async (
    chatId: string,
    content: string,
    type: ChatMessage['type'] = 'text',
  ): Promise<ChatMessage> => {
    const res = await apiClient.post<BackendChatMessage>(`/chats/${chatId}/messages`, {
      content,
      type,
    })
    return toFrontendChatMessage(res.data, chatId)
  },

  // 채팅방 생성
  createChat: async (petId: string, otherUserId: string): Promise<ChatRoom> => {
    const res = await apiClient.post<BackendChatRoom>('/chats', { petId, otherUserId })
    return toFrontendChatRoom(res.data)
  },

  // 읽음 처리
  markAsRead: async (chatId: string): Promise<void> => {
    await apiClient.post(`/chats/${chatId}/read`)
  },

  // 채팅방 나가기
  leaveChat: async (chatId: string): Promise<void> => {
    await apiClient.post(`/chats/${chatId}/leave`)
  },

  // 채팅방 신고
  reportChat: async (chatId: string, reason: string): Promise<void> => {
    await apiClient.post(`/chats/${chatId}/report`, { reason })
  },
}
