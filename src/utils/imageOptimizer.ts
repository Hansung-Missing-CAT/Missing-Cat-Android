// 업로드 이미지 리사이즈 및 압축 유틸
// Canvas API 사용 — 서버 전송 전 클라이언트 사이드에서 처리

const MAX_WIDTH = 1024
const MAX_HEIGHT = 1024
const JPEG_QUALITY = 0.82 // 화질 vs 용량 균형점

interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  outputType?: 'image/jpeg' | 'image/webp'
}

/**
 * 이미지 File → 압축된 Blob 반환
 * 최대 크기 초과 시 비율 유지하며 리사이즈, JPEG/WebP로 변환
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<Blob> {
  const {
    maxWidth = MAX_WIDTH,
    maxHeight = MAX_HEIGHT,
    quality = JPEG_QUALITY,
    outputType = 'image/jpeg',
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // 최대 크기를 초과하면 비율 유지하며 축소
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas 2D context를 생성할 수 없습니다.'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('이미지 압축에 실패했습니다.'))
        },
        outputType,
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('이미지를 읽을 수 없습니다.'))
    }

    img.src = url
  })
}

/** 압축된 Blob을 File 객체로 래핑 */
export async function compressImageToFile(file: File, options?: CompressOptions): Promise<File> {
  const blob = await compressImage(file, options)
  const ext = (options?.outputType ?? 'image/jpeg') === 'image/webp' ? 'webp' : 'jpg'
  const name = file.name.replace(/\.[^.]+$/, `.${ext}`)
  return new File([blob], name, { type: blob.type })
}

/** 파일 배열을 일괄 압축 */
export async function compressImages(files: File[], options?: CompressOptions): Promise<File[]> {
  return Promise.all(files.map((f) => compressImageToFile(f, options)))
}
