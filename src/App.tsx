import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NavBar from '@/components/NavBar/NavBar'
import { useAuth } from '@/hooks/useAuth'

// 라우트별 코드 스플리팅 (Phase 8 최적화 항목 선적용)
const SplashPage = lazy(() => import('@/pages/splash/SplashPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const HomePage = lazy(() => import('@/pages/home/HomePage'))
const ReportPage = lazy(() => import('@/pages/report/ReportPage'))
const TipOffPage = lazy(() => import('@/pages/tipoff/TipOffPage'))
const ChatPage = lazy(() => import('@/pages/chat/ChatPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))

// 인증된 사용자만 접근 가능한 레이아웃
function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <>
      <Outlet />
      <NavBar />
    </>
  )
}

// 비인증 사용자 전용 레이아웃 (로그인/회원가입)
function AuthLayout() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* 스플래시 */}
          <Route path="/splash" element={<SplashPage />} />

          {/* 비인증 전용 */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* 인증 필요 */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/report/*" element={<ReportPage />} />
            <Route path="/tipoff/*" element={<TipOffPage />} />
            <Route path="/chat/*" element={<ChatPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Route>

          {/* 미매칭 경로 → 스플래시 */}
          <Route path="*" element={<Navigate to="/splash" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
