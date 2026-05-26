import type { MissingPost, Comment, MissingStatus, LostTimezone } from '@/types'

// 백엔드 pet 응답 타입 (snake_case)
export interface BackendPet {
  id: string
  user_id: string
  name: string
  breed: string
  age?: number
  gender?: 'male' | 'female'
  color?: string
  description?: string
  district: string
  address: string
  detail_address?: string
  lat?: number
  lng?: number
  lost_date: string
  lost_timezone: string
  reward: number
  status: '실종' | '찾음'
  photo_urls: string[]
  likes_count: number
  comments_count: number
  views_count?: number
  is_liked?: boolean
  reporter_name: string
  reporter_avatar?: string
  created_at: string
  updated_at: string
}

// 백엔드 comment 응답 타입
export interface BackendComment {
  id: string
  user_id: string
  content: string
  user_name: string
  user_avatar?: string
  created_at: string
}

// 백엔드 pet 생성/수정 요청 타입 (백엔드 스펙 필드명 그대로)
export interface BackendPetCreate {
  name: string
  breed: string
  age?: number
  gender?: 'male' | 'female'
  color?: string
  description?: string
  district: string
  address: string
  detail_address?: string
  lat?: number
  lng?: number
  lostDate: string
  lostTimezone: string
  reward: number
  photoUrls: string[]
}

// 백엔드 status(한국어) → 프론트 MissingStatus 변환
const toMissingStatus = (status: '실종' | '찾음'): MissingStatus =>
  status === '찾음' ? 'found' : 'missing'

// 프론트 MissingStatus → 백엔드 status(한국어) 변환
export const toBackendStatus = (status: MissingStatus): '실종' | '찾음' =>
  status === 'found' ? '찾음' : '실종'

// 백엔드 pet → 프론트 MissingPost 변환
export const toFrontendPet = (b: BackendPet): MissingPost => ({
  id: b.id,
  userId: b.user_id,
  authorNickname: b.reporter_name,
  authorProfileImage: b.reporter_avatar,
  petName: b.name,
  species: b.breed,
  age: b.age,
  gender: b.gender,
  furColor: b.color,
  description: b.description,
  location: {
    address: b.address,
    detailAddress: b.detail_address,
    lat: b.lat,
    lng: b.lng,
  },
  lostAt: b.lost_date,
  lostTimezone: b.lost_timezone as LostTimezone,
  reward: b.reward,
  status: toMissingStatus(b.status),
  images: b.photo_urls,
  likeCount: b.likes_count,
  commentCount: b.comments_count,
  isLiked: b.is_liked,
  createdAt: b.created_at,
  updatedAt: b.updated_at,
})

// 백엔드 comment → 프론트 Comment 변환 (postId는 호출부에서 전달)
export const toFrontendComment = (b: BackendComment, postId: string): Comment => ({
  id: b.id,
  postId,
  userId: b.user_id,
  authorNickname: b.user_name,
  authorProfileImage: b.user_avatar,
  content: b.content,
  createdAt: b.created_at,
})

// 프론트 폼 데이터 → 백엔드 pet 생성/수정 요청 변환
export const toBackendPet = (
  form: {
    petName: string
    species: string
    age: string
    gender: 'male' | 'female' | ''
    furColor: string
    description: string
    address: string
    detailAddress: string
    lostDate: string
    lostTimezone: string
    reward: number
  },
  photoUrls: string[],
): BackendPetCreate => {
  // 주소에서 구(district) 추출: "서울시 마포구 합정동" → "마포구"
  const districtMatch = form.address.match(/(\S+구)/)
  const district = districtMatch?.[1] ?? form.address

  return {
    name: form.petName,
    breed: form.species,
    age: form.age ? parseInt(form.age, 10) : undefined,
    gender: form.gender || undefined,
    color: form.furColor || undefined,
    description: form.description || undefined,
    district,
    address: form.address,
    detail_address: form.detailAddress || undefined,
    lostDate: form.lostDate,
    lostTimezone: form.lostTimezone,
    reward: form.reward,
    photoUrls,
  }
}
