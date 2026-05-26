const LIKE_KEY = 'liked_pets'

function getLikedPets(): Set<string> {
  try {
    const stored = localStorage.getItem(LIKE_KEY)
    return stored ? new Set<string>(JSON.parse(stored) as string[]) : new Set<string>()
  } catch {
    return new Set<string>()
  }
}

// 좋아요 상태 저장 (petId 추가)
export function setLiked(petId: string): void {
  const likes = getLikedPets()
  likes.add(petId)
  localStorage.setItem(LIKE_KEY, JSON.stringify([...likes]))
}

// 좋아요 취소 상태 저장 (petId 제거)
export function setUnliked(petId: string): void {
  const likes = getLikedPets()
  likes.delete(petId)
  localStorage.setItem(LIKE_KEY, JSON.stringify([...likes]))
}

// 로컬에서 좋아요 여부 확인
export function isLiked(petId: string): boolean {
  return getLikedPets().has(petId)
}
