import axios from 'axios'
import apiClient from './api'

// 백엔드 POST /api/uploads/presign 실제 응답 형식
interface PresignResponse {
  bucket: string
  path: string
  contentType: string
  token: string
  uploadUrl: string   // Supabase Storage에 PUT할 URL
  fileUrl: string     // 업로드 완료 후 공개 접근 가능한 URL
  expiresIn: number
}

// Presigned URL 발급
const getPresignedUrl = async (
  bucket: string,
  fileName: string,
  contentType: string,
): Promise<PresignResponse> => {
  const res = await apiClient.post<PresignResponse>('/uploads/presign', {
    bucket,
    fileName,
    contentType,
  })
  return res.data
}

// uploadUrl에 파일 바이너리 업로드 (Content-Type 헤더 필수)
const uploadFile = async (uploadUrl: string, file: File, contentType: string): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': contentType },
  })
}

// 여러 장의 사진을 순차적으로 presign → upload → fileUrl 배열 반환
// fileUrl은 공개 접근 가능한 URL이므로 프론트에서 <img src>로 직접 사용 가능
const uploadPetPhotos = async (files: File[]): Promise<string[]> => {
  const fileUrls: string[] = []
  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { uploadUrl, fileUrl } = await getPresignedUrl('pet-photos', fileName, file.type)
    await uploadFile(uploadUrl, file, file.type)
    fileUrls.push(fileUrl)
  }
  return fileUrls
}

// 프로필 이미지 단건 업로드 — 'avatars' 버킷, 공개 URL 반환
const uploadAvatar = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `avatar_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { uploadUrl, fileUrl } = await getPresignedUrl('avatars', fileName, file.type)
  await uploadFile(uploadUrl, file, file.type)
  return fileUrl
}

export const uploadService = {
  getPresignedUrl,
  uploadFile,
  uploadPetPhotos,
  uploadAvatar,
}
