import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

// 서버 → 클라이언트 이벤트 맵
interface ServerToClientEvents {
  'message.new': (data: { chatId: string; message: unknown }) => void
  'message.read': (data: { chatId: string; userId: string }) => void
  'chat.updated': (data: { chatId: string; lastMessage: string }) => void
  'presence.update': (data: { userId: string; isOnline: boolean }) => void
  'tip.progress': (data: { tipId: string; progress: number; status: string }) => void
  'tip.complete': (data: { tipId: string; results: unknown[] }) => void
  'notification.new': (data: { notification: unknown }) => void
}

// 클라이언트 → 서버 이벤트 맵
interface ClientToServerEvents {
  'join:chat': (data: { chatId: string }) => void
  'leave:chat': (data: { chatId: string }) => void
}

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3000'

let socket: AppSocket | null = null

export const socketService = {
  // 소켓 연결 (로그인 후 호출)
  connect: (token: string): void => {
    if (socket?.connected) return
    socket = io(WS_URL, {
      path: '/ws',
      auth: { token },
      transports: ['websocket', 'polling'],
    })
  },

  // 소켓 연결 해제 (로그아웃 후 호출)
  disconnect: (): void => {
    socket?.disconnect()
    socket = null
  },

  // 채팅방 참여
  joinChat: (chatId: string): void => {
    socket?.emit('join:chat', { chatId })
  },

  // 채팅방 퇴장
  leaveChat: (chatId: string): void => {
    socket?.emit('leave:chat', { chatId })
  },

  // 새 메시지 수신 리스너 등록
  onNewMessage: (
    cb: (data: { chatId: string; message: unknown }) => void,
  ): void => {
    socket?.on('message.new', cb)
  },

  // 읽음 처리 이벤트 리스너 등록
  onMessageRead: (
    cb: (data: { chatId: string; userId: string }) => void,
  ): void => {
    socket?.on('message.read', cb)
  },

  // AI 분석 진행률 리스너 등록
  onTipProgress: (
    cb: (data: { tipId: string; progress: number; status: string }) => void,
  ): void => {
    socket?.on('tip.progress', cb)
  },

  // AI 분석 완료 리스너 등록
  onTipComplete: (
    cb: (data: { tipId: string; results: unknown[] }) => void,
  ): void => {
    socket?.on('tip.complete', cb)
  },

  // 새 알림 리스너 등록
  onNotification: (
    cb: (data: { notification: unknown }) => void,
  ): void => {
    socket?.on('notification.new', cb)
  },

  // 온라인 상태 변경 리스너 등록
  onPresenceUpdate: (
    cb: (data: { userId: string; isOnline: boolean }) => void,
  ): void => {
    socket?.on('presence.update', cb)
  },

  // 특정 이벤트 리스너 제거
  off: (event: keyof ServerToClientEvents): void => {
    socket?.off(event)
  },

  // 소켓 연결 여부
  isConnected: (): boolean => socket?.connected ?? false,
}
