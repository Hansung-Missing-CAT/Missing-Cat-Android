import apiClient from './api'
import type { MissingPost, Comment } from '@/types'
import {
  toFrontendPet,
  toFrontendComment,
  type BackendPet,
  type BackendComment,
  type BackendPetCreate,
} from '@/utils/transform'

// GET /api/pets 쿼리 파라미터
export interface ListPetsParams {
  district?: string
  q?: string
  sort?: 'latest' | 'likes' | 'comments'
  status?: '실종' | '찾음'
  limit?: number
  cursor?: string
  userId?: string  // 내 게시글 필터
}

// 백엔드가 페이지네이션 래퍼로 응답하는 경우
interface PaginatedResponse {
  data: BackendPet[]
  nextCursor?: string
  hasMore?: boolean
}

// 배열 또는 래핑 응답에서 BackendPet[] 추출
const extractPets = (raw: BackendPet[] | PaginatedResponse): BackendPet[] => {
  if (Array.isArray(raw)) return raw
  return raw.data
}

// 배열 또는 래핑 응답에서 BackendComment[] 추출 (null/undefined 안전 처리)
interface PaginatedCommentResponse {
  data: BackendComment[]
  nextCursor?: string
  hasMore?: boolean
}
const extractComments = (raw: BackendComment[] | PaginatedCommentResponse | null | undefined): BackendComment[] => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  return raw.data ?? []
}

// 단건 댓글 응답 — 직접 객체 또는 { data: BackendComment } 래핑 처리
interface WrappedCommentResponse {
  data: BackendComment
}
const extractComment = (raw: BackendComment | WrappedCommentResponse): BackendComment => {
  if ('data' in raw && !('id' in raw)) return (raw as WrappedCommentResponse).data
  return raw as BackendComment
}

// PATCH /api/pets/:id 요청 타입 (부분 수정 + 상태 변경 포함)
export type UpdatePetParams = Partial<BackendPetCreate>

export const petsService = {
  // 게시글 목록 조회 — 배열 또는 { data, nextCursor, hasMore } 래핑 응답 모두 처리
  listPets: async (params?: ListPetsParams): Promise<MissingPost[]> => {
    const res = await apiClient.get<BackendPet[] | PaginatedResponse>('/pets', { params })
    return extractPets(res.data).map(toFrontendPet)
  },

  // 게시글 단건 조회 (조회수 자동 증가)
  getPet: async (id: string): Promise<MissingPost> => {
    const res = await apiClient.get<BackendPet>(`/pets/${id}`)
    return toFrontendPet(res.data)
  },

  // 게시글 등록
  createPet: async (data: BackendPetCreate): Promise<MissingPost> => {
    const res = await apiClient.post<BackendPet>('/pets', data)
    return toFrontendPet(res.data)
  },

  // 게시글 수정 (작성자만)
  updatePet: async (id: string, data: UpdatePetParams): Promise<MissingPost> => {
    const res = await apiClient.patch<BackendPet>(`/pets/${id}`, data)
    return toFrontendPet(res.data)
  },

  // 게시글 삭제 (작성자만)
  deletePet: async (id: string): Promise<void> => {
    await apiClient.delete(`/pets/${id}`)
  },

  // 좋아요
  likePet: async (id: string): Promise<void> => {
    await apiClient.post(`/pets/${id}/like`)
  },

  // 좋아요 취소
  unlikePet: async (id: string): Promise<void> => {
    await apiClient.delete(`/pets/${id}/like`)
  },

  // 댓글 목록 조회 — 배열 또는 래핑 응답 모두 처리
  getComments: async (petId: string): Promise<Comment[]> => {
    const res = await apiClient.get<BackendComment[] | PaginatedCommentResponse>(`/pets/${petId}/comments`)
    return extractComments(res.data).map((c) => toFrontendComment(c, petId))
  },

  // 댓글 작성 — 직접 객체 또는 { data: BackendComment } 래핑 응답 모두 처리
  createComment: async (petId: string, content: string): Promise<Comment> => {
    const res = await apiClient.post<BackendComment | WrappedCommentResponse>(`/pets/${petId}/comments`, { content })
    return toFrontendComment(extractComment(res.data), petId)
  },

  // 댓글 삭제
  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`)
  },
}
