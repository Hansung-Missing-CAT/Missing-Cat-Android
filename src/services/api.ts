import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

// 환경변수에서 Base URL 읽기 — 개발 환경에서는 Vite 프록시를 사용하므로 기본값 /api
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // AI 분석 요청 대비 15초
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 — 토큰 자동 첨부
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 토큰 갱신 중복 방지용 상태
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = []

// 대기 중인 요청들을 갱신된 토큰으로 처리
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else if (token) {
      resolve(token)
    } else {
      reject(new Error('토큰 갱신 실패'))
    }
  })
  failedQueue = []
}

// _retry 플래그를 포함한 확장 설정 타입
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// 응답 인터셉터 — 401 시 refreshToken으로 자동 갱신 후 재시도
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as RetryableConfig

    // 401 외 에러이거나 이미 재시도한 요청은 그대로 반환
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // 이미 갱신 중이면 대기열에 추가 후 갱신 완료 시 재시도
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // 인터셉터 재귀 방지를 위해 base axios 사용
      const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
      const { accessToken, refreshToken: newRefreshToken } = res.data as {
        accessToken: string
        refreshToken?: string
      }

      localStorage.setItem('accessToken', accessToken)
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }

      processQueue(null, accessToken)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient
