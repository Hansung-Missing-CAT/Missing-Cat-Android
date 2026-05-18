import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NavBar from '@/components/NavBar/NavBar'
import { useAuth } from '@/hooks/useAuth'

// 라우트별 코드 스플리팅
const SplashPage = lazy(() => import('@/pages/splash/SplashPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))

// 메인 탭 페이지
const HomePage = lazy(() => import('@/pages/home/HomePage'))
const ReportPage = lazy(() => import('@/pages/report/ReportPage'))
const TipOffPage = lazy(() => import('@/pages/tipoff/TipOffPage'))
const ChatPage = lazy(() => import('@/pages/chat/ChatPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))

// 서브 페이지 (NavBar 없음)
const PostDetailPage = lazy(() => import('@/pages/home/PostDetailPage'))
const SearchPage = lazy(() => import('@/pages/home/SearchPage'))
const NotificationPage = lazy(() => import('@/pages/home/NotificationPage'))
const ChatRoomPage = lazy(() => import('@/pages/chat/ChatRoomPage'))

// 하단 탭 바 포함 레이아웃
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

// 서브 페이지용 레이아웃 (NavBar 없음)
function ProtectedSubLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

// 비인증 사용자 전용 레이아웃
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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* 서브 페이지 (NavBar 없음) */}
          <Route element={<ProtectedSubLayout />}>
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/chat/:roomId" element={<ChatRoomPage />} />
          </Route>

          {/* 메인 탭 페이지 (NavBar 포함) */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/report/*" element={<ReportPage />} />
            <Route path="/tipoff/*" element={<TipOffPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Route>

          {/* 미매칭 경로 → 스플래시 */}
          <Route path="*" element={<Navigate to="/splash" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
