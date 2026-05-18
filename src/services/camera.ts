import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'

export interface CapturedPhoto {
  dataUrl: string
  format: string
}

// 갤러리에서 사진 선택 (최대 여러 장)
export async function pickFromGallery(): Promise<CapturedPhoto> {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Photos,
    quality: 80,
    width: 1080,
    correctOrientation: true,
  })

  return {
    dataUrl: photo.dataUrl!,
    format: photo.format,
  }
}

// 카메라로 즉시 촬영
export async function takePhoto(): Promise<CapturedPhoto> {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera,
    quality: 80,
    width: 1080,
    correctOrientation: true,
  })

  return {
    dataUrl: photo.dataUrl!,
    format: photo.format,
  }
}

// 갤러리/카메라 선택 시트 (웹 폴백 포함)
export async function selectPhoto(): Promise<CapturedPhoto> {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Prompt,
    quality: 80,
    width: 1080,
    correctOrientation: true,
    promptLabelHeader: '사진 선택',
    promptLabelPhoto: '갤러리에서 선택',
    promptLabelPicture: '카메라로 촬영',
  })

  return {
    dataUrl: photo.dataUrl!,
    format: photo.format,
  }
}

// 네이티브 환경 여부 확인 (웹 vs 앱)
export const isNative = Capacitor.isNativePlatform()
