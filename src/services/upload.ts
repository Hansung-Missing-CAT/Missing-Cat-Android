import axios from 'axios'
import apiClient from './api'

interface PresignResponse {
  signedUrl: string
  path: string
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

// Presigned URL에 파일 바이너리 업로드 (Content-Type 헤더 필수)
const uploadFile = async (signedUrl: string, file: File, contentType: string): Promise<void> => {
  await axios.put(signedUrl, file, {
    headers: { 'Content-Type': contentType },
  })
}

// 여러 장의 사진을 순차적으로 presign → upload → path 배열 반환
const uploadPetPhotos = async (files: File[]): Promise<string[]> => {
  const paths: string[] = []
  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { signedUrl, path } = await getPresignedUrl('pet-photos', fileName, file.type)
    await uploadFile(signedUrl, file, file.type)
    paths.push(path)
  }
  return paths
}

// 프로필 이미지 단건 업로드 — 'avatars' 버킷 사용
const uploadAvatar = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `avatar_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { signedUrl, path } = await getPresignedUrl('avatars', fileName, file.type)
  await uploadFile(signedUrl, file, file.type)
  return path
}

export const uploadService = {
  getPresignedUrl,
  uploadFile,
  uploadPetPhotos,
  uploadAvatar,
}
