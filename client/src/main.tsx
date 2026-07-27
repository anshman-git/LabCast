import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './features/auth/auth.context.tsx'
import { ProtectedRoute } from './features/auth/components/ProtectedRoute.tsx'
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage.tsx'
import { LoginPage } from './features/auth/pages/LoginPage.tsx'
import { RegisterPage } from './features/auth/pages/RegisterPage.tsx'
import { LiveClassroomPage } from './features/classroom/pages/LiveClassroomPage.tsx'
import { ToastProvider } from './features/notifications/toast.context.tsx'
import { CreateRoomPage } from './features/rooms/pages/CreateRoomPage.tsx'
import { JoinRoomPage } from './features/rooms/pages/JoinRoomPage.tsx'
import { TeacherDashboardPage } from './features/teacher-dashboard/pages/TeacherDashboardPage.tsx'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 }, mutations: { retry: 0 } } })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<App />} />
              <Route path="/join" element={<JoinRoomPage />} />
              <Route path="/rooms/join" element={<JoinRoomPage />} />
              <Route path="/room/:roomCode" element={<LiveClassroomPage />} />

              {/* Teacher Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Teacher Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
                <Route path="/rooms/create" element={<CreateRoomPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<App />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
)
