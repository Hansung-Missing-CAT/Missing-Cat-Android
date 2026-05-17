import { useAuthStore } from '@/stores/authStore'

// 인증 상태와 액션을 한 번에 제공하는 커스텀 훅
export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore()
  return { user, isAuthenticated, setAuth, clearAuth, updateUser }
}
