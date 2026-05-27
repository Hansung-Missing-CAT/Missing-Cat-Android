import apiClient from './api'
import type { TipStatus, MatchingResult } from '@/types'
import { toFrontendPet, type BackendPet } from '@/utils/transform'

interface AnalyzeTipResponse {
  tipId: string
  status: TipStatus
}

interface BackendTipResult {
  petId: string
  similarity: number
  pet: BackendPet
}

interface BackendTipStatus {
  tipId: string
  status: TipStatus
  progress?: number
  results?: BackendTipResult[]
  errorMsg?: string | null
}

export const tipsService = {
  // AI 분석 요청 — imageUrls(3~5장)를 전달하면 tipId를 즉시 반환
  analyzeTip: async (imageUrls: string[]): Promise<{ tipId: string; status: TipStatus }> => {
    const res = await apiClient.post<AnalyzeTipResponse>('/tips/analyze', { imageUrls })
    return res.data
  },

  // 분석 상태 조회 — results 내 pet 객체는 toFrontendPet으로 변환
  getTipStatus: async (tipId: string): Promise<{
    tipId: string
    status: TipStatus
    progress?: number
    results?: MatchingResult[]
    errorMsg?: string
  }> => {
    const res = await apiClient.get<BackendTipStatus>(`/tips/${tipId}`)
    const { status, progress, results, errorMsg } = res.data
    return {
      tipId,
      status,
      progress,
      results: results?.map((r) => ({
        postId: r.petId,
        post: toFrontendPet(r.pet),
        similarityScore: r.similarity,
      })),
      errorMsg: errorMsg ?? undefined,
    }
  },

  // 선택한 게시글에 제보 전송 → 생성된 채팅방 ID 반환
  sendTip: async (tipId: string, petId: string): Promise<{ chatId: string }> => {
    const res = await apiClient.post<{ chatId: string }>(`/tips/${tipId}/send`, { petId })
    return res.data
  },

  // 폴링 유틸: 2초 간격으로 getTipStatus 호출.
  // maxAttempts 기본값 150회(5분). AI 모델 로딩 등 초기 지연을 고려한 값.
  // 반환값은 폴링을 중단하는 cleanup 함수
  pollTipStatus: (
    tipId: string,
    onProgress: (progress: number) => void,
    onComplete: (results: MatchingResult[]) => void,
    onError: (msg?: string) => void,
    maxAttempts = 90,
  ): (() => void) => {
    let count = 0
    const MAX_ATTEMPTS = maxAttempts
    let timerId: ReturnType<typeof setInterval> | null = null

    const poll = async () => {
      count++
      if (count > MAX_ATTEMPTS) {
        if (timerId) clearInterval(timerId)
        onError('분석 시간이 초과되었습니다.')
        return
      }
      try {
        const result = await tipsService.getTipStatus(tipId)
        if (result.status === 'done') {
          if (timerId) clearInterval(timerId)
          onComplete(result.results ?? [])
        } else if (result.status === 'error') {
          if (timerId) clearInterval(timerId)
          onError(result.errorMsg)
        } else {
          onProgress(result.progress ?? 0)
        }
      } catch {
        // 네트워크 오류 시 폴링 계속
      }
    }

    timerId = setInterval(poll, 2000)
    void poll() // 첫 번째 폴링 즉시 실행
    return () => { if (timerId) clearInterval(timerId) }
  },
}
