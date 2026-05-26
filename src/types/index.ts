// 사용자 역할 타입
export type UserRole = 'owner' | 'reporter'

// 실종 상태 타입
export type MissingStatus = 'missing' | 'found'

// 사용자 정보
export interface User {
  id: string
  email: string
  nickname: string
  profileImage?: string
  phone?: string
  role?: UserRole
}

// 실종 신고 게시글
export interface MissingPost {
  id: string
  userId: string
  authorNickname: string
  authorProfileImage?: string
  petName: string
  species: string
  age?: number
  gender?: 'male' | 'female'
  furColor?: string
  description?: string
  location: Location
  lostAt: string
  lostTimezone: LostTimezone
  reward: number
  status: MissingStatus
  images: string[]
  likeCount: number
  commentCount: number
  viewCount?: number
  isLiked?: boolean
  createdAt: string
  updatedAt: string
}

// 위치 정보
export interface Location {
  address: string
  detailAddress?: string
  lat?: number
  lng?: number
}

// 실종 시간대
export type LostTimezone =
  | 'dawn'      // 새벽 0-6시
  | 'morning'   // 오전 6-12시
  | 'afternoon' // 오후 12-18시
  | 'evening'   // 저녁 18-24시

// 댓글
export interface Comment {
  id: string
  postId: string
  userId: string
  authorNickname: string
  authorProfileImage?: string
  content: string
  createdAt: string
}

// 알림 타입 — DB 실제 값 + 프론트 전용 타입 포함
export type NotificationType =
  | 'comment'        // 댓글
  | 'like'           // 좋아요
  | 'tip'            // 제보 (DB)
  | 'found'          // 찾음 (DB)
  | 'nearby_report'  // 근처 제보 (DB)
  | 'matching'       // AI 매칭 (프론트 전용)
  | 'tipoff'         // 제보 (프론트 전용, 구버전)
  | 'nearby'         // 근처 (프론트 전용, 구버전)

// 알림
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  relatedPostId?: string
  relatedChatId?: string
  createdAt: string
}

// 채팅방
export interface ChatRoom {
  id: string
  participants: User[]
  relatedPost?: MissingPost
  lastMessage?: ChatMessage
  unreadCount: number
  updatedAt: string
}

// 채팅 메시지
export interface ChatMessage {
  id: string
  chatRoomId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'location'
  imageUrl?: string
  location?: Location
  isRead: boolean
  createdAt: string
}

// AI 매칭 결과
export interface MatchingResult {
  postId: string
  post: MissingPost
  similarityScore: number // 0~100
}

// 제보 정보
export interface TipOff {
  images: string[]
  location: Location
  matchingResults?: MatchingResult[]
}

// API 공통 응답
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

// 페이지네이션
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// 백엔드 에러 응답
export interface ApiError {
  code: string
  message: string
  fields?: Record<string, string>
}

// 제보 분석 상태
export type TipStatus = 'processing' | 'done' | 'error'

// 제보 분석 응답
export interface TipAnalysis {
  tipId: string
  status: TipStatus
  progress?: number
  results?: MatchingResult[]
  errorMsg?: string
}
