import type { MissingPost, Comment, MissingStatus, LostTimezone } from '@/types'

// 백엔드 missing_pets 테이블 실제 컬럼 기준 응답 타입 (snake_case)
// 필드명이 백엔드 버전에 따라 달라질 수 있어 가능한 별칭을 optional로 모두 선언
export interface BackendPet {
  id: string
  user_id: string
  name: string
  breed: string
  age?: number | string   // DB 컬럼이 TEXT이므로 문자열로 올 수 있음
  gender?: '남' | '여'   // DB CHECK: '남' | '여'
  color?: string
  description?: string
  district: string
  // 주소 필드 — 백엔드가 address 또는 location 컬럼명 사용
  address?: string
  location?: string
  detail_address?: string
  lat?: number
  lng?: number
  // 실종 일시 — lost_date 또는 last_seen 컬럼명 사용
  lost_date?: string
  last_seen?: string
  // 실종 시간대 — lost_timezone 또는 lost_time 컬럼명 사용
  lost_timezone?: string
  lost_time?: string
  reward: number
  status: '실종' | '찾음'
  // 사진 필드 — 대표 1장(photo) + 전체 배열(photos), photo_urls는 사용하지 않음
  photo?: string | null
  photos?: string[] | null
  likes_count: number
  comments_count: number
  views?: number        // DB 실제 컬럼명: views (views_count 아님)
  is_liked?: boolean
  // 작성자 정보 — JOIN 미포함 시 빈 값 fallback
  reporter_name?: string
  reporter_avatar?: string
  created_at: string
  updated_at: string
}

// 백엔드 comment 응답 타입 (user JOIN 미포함 시 user_name이 없을 수 있음)
export interface BackendComment {
  id: string
  user_id: string
  pet_id?: string
  content: string
  user_name?: string
  user_avatar?: string
  created_at: string
}

// 백엔드 pet 생성/수정 요청 타입 (pet.service.js 기대 필드명 기준)
export interface BackendPetCreate {
  name: string
  breed: string
  age?: string | number  // DB 컬럼이 TEXT이므로 문자열로 전송
  gender?: '남' | '여'  // DB CHECK: '남' | '여'
  color?: string
  description?: string
  district: string
  location: string       // 주소 문자열 (프론트 address → 백엔드 location)
  detailAddress?: string
  latitude?: number
  longitude?: number
  lostDate: string
  lostTime: string | null  // TIME 타입 "HH:MM" (프론트 lostTimezone → 백엔드 lostTime)
  reward: number
  photoUrls: string[]
  status?: '실종' | '찾음'
}

// 프론트 시간대 문자열 → DB TIME 타입 변환 (각 시간대의 대표 시간)
const timezoneToTime = (tz: string | undefined): string | null => {
  const map: Record<string, string> = {
    dawn: '03:00',
    morning: '09:00',
    afternoon: '15:00',
    evening: '21:00',
  }
  return tz ? (map[tz] ?? null) : null
}

// DB TIME 문자열 → 프론트 시간대 변환 (대표 시간 정확 매칭, 실패 시 시간 범위로 판단)
const timeToTimezone = (time: string | undefined): LostTimezone => {
  if (!time) return 'morning'
  const exact: Record<string, LostTimezone> = {
    '03:00': 'dawn',
    '09:00': 'morning',
    '15:00': 'afternoon',
    '21:00': 'evening',
  }
  const key = time.slice(0, 5) // "HH:MM" 형식으로 자름
  if (exact[key]) return exact[key]
  const hour = parseInt(key.split(':')[0], 10)
  if (hour < 6) return 'dawn'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

// 백엔드 status(한국어) → 프론트 MissingStatus 변환
const toMissingStatus = (status: '실종' | '찾음'): MissingStatus =>
  status === '찾음' ? 'found' : 'missing'

// 프론트 MissingStatus → 백엔드 status(한국어) 변환
export const toBackendStatus = (status: MissingStatus): '실종' | '찾음' =>
  status === 'found' ? '찾음' : '실종'

// 사진 배열 정규화:
// photos 배열 → 그대로, photo 단건 → [photo], 없으면 []
const extractImages = (b: BackendPet): string[] => {
  if (b.photos && b.photos.length > 0) return b.photos
  if (b.photo) return [b.photo]
  return []
}

// 백엔드 pet → 프론트 MissingPost 변환 (필드명 별칭 fallback 포함)
export const toFrontendPet = (b: BackendPet): MissingPost => ({
  id: b.id,
  userId: b.user_id,
  authorNickname: b.reporter_name ?? '',
  authorProfileImage: b.reporter_avatar,
  petName: b.name,
  species: b.breed,
  // DB가 TEXT이므로 문자열 또는 숫자 모두 안전하게 파싱
  age: b.age !== undefined && b.age !== null
    ? (typeof b.age === 'string' ? (parseInt(b.age, 10) || undefined) : b.age)
    : undefined,
  // DB gender 값 '남'/'여' → 프론트 'male'/'female' 변환
  gender: b.gender === '남' ? 'male' : b.gender === '여' ? 'female' : undefined,
  furColor: b.color,
  description: b.description,
  location: {
    // 백엔드가 location/address를 미반환 시 district(구 단위)로 fallback
    address: b.location ?? b.address ?? b.district ?? '',
    detailAddress: b.detail_address,
    lat: b.lat,
    lng: b.lng,
  },
  // lost_date 또는 last_seen 컬럼 fallback
  lostAt: b.lost_date ?? b.last_seen ?? '',
  // lost_time(TIME) → 시간대 문자열 변환, lost_timezone은 구버전 컬럼 fallback
  lostTimezone: b.lost_timezone
    ? (b.lost_timezone as LostTimezone)
    : timeToTimezone(b.lost_time),
  reward: b.reward,
  status: toMissingStatus(b.status),
  images: extractImages(b),
  likeCount: b.likes_count,
  commentCount: b.comments_count,
  viewCount: b.views,  // DB 실제 컬럼명: views
  isLiked: b.is_liked,
  createdAt: b.created_at,
  updatedAt: b.updated_at,
})

// 백엔드 comment → 프론트 Comment 변환 (postId는 호출부에서 전달)
// user_name이 JOIN 없이 오지 않을 경우 '익명' fallback
export const toFrontendComment = (b: BackendComment, postId: string): Comment => ({
  id: b.id,
  postId: b.pet_id ?? postId,
  userId: b.user_id,
  authorNickname: b.user_name ?? '익명',
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
    lat?: number
    lng?: number
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
    age: form.age || undefined,  // DB가 TEXT이므로 문자열 그대로 전송
    // 프론트 'male'/'female' → DB '남'/'여' 변환
    gender: form.gender === 'male' ? '남' : form.gender === 'female' ? '여' : undefined,
    color: form.furColor || undefined,
    description: form.description || undefined,
    district,
    location: form.address,
    detailAddress: form.detailAddress || undefined,
    latitude: form.lat,
    longitude: form.lng,
    lostDate: form.lostDate,
    lostTime: timezoneToTime(form.lostTimezone),
    reward: form.reward,
    photoUrls,
    status: '실종',
  }
}
