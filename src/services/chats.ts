import apiClient from './api'
import type { ChatRoom, ChatMessage, User, MissingPost } from '@/types'

// 백엔드 채팅방 응답 타입 (snake_case)
interface BackendChatRoom {
  id: string
  pet_id?: string
  pet_name?: string
  pet_photo?: string
  other_user_id: string
  other_user_name: string
  other_user_avatar?: string
  is_online?: boolean
  last_message?: string
  last_message_type?: ChatMessage['type']
  last_message_at?: string
  unread_count: number
  created_at: string
  updated_at: string
}

// 백엔드 메시지 응답 타입 (snake_case)
export interface BackendChatMessage {
  id: string
  sender_id: string
  content: string
  type: ChatMessage['type']
  image_url?: string
  location?: { lat?: number; lng?: number; address?: string }
  read_by: string[]
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

  const otherUser: User = {
    id: b.other_user_id,
    email: '',
    nickname: b.other_user_name,
    profileImage: b.other_user_avatar,
  }
  const me: User = { id: myId, email: '', nickname: '나' }

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
    content: b.content,
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
  // 채팅방 목록 조회
  getChatList: async (params?: { q?: string; limit?: number }): Promise<ChatRoom[]> => {
    const res = await apiClient.get<BackendChatRoom[]>('/chats', { params })
    return res.data.map(toFrontendChatRoom)
  },

  // 채팅방 상세 조회
  getChat: async (chatId: string): Promise<ChatRoom> => {
    const res = await apiClient.get<BackendChatRoom>(`/chats/${chatId}`)
    return toFrontendChatRoom(res.data)
  },

  // 메시지 목록 조회
  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const res = await apiClient.get<BackendChatMessage[]>(`/chats/${chatId}/messages`)
    return res.data.map((m) => toFrontendChatMessage(m, chatId))
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
