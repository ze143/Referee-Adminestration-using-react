import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

// ====== Lazy load ======
const Login = lazy(() => import('@/pages/Login'))
const TestComponents = lazy(() => import('@/pages/TestComponents'))

// Admin
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const Referees = lazy(() => import('@/pages/admin/Referees'))
const Competitions = lazy(() => import('@/pages/admin/Competitions'))
const Matches = lazy(() => import('@/pages/admin/Matches'))
const Evaluations = lazy(() => import('@/pages/admin/Evaluations'))
const Finance = lazy(() => import('@/pages/admin/Finance'))
const Supervisors = lazy(() => import('@/pages/admin/Supervisors'))
const Reports = lazy(() => import('@/pages/admin/Reports'))
const Users = lazy(() => import('@/pages/admin/Users'))  // ✅ جديد
const Notifications = lazy(() => import('@/pages/admin/Notifications'))

// Editor
const EditorLayout = lazy(() => import('@/components/layout/EditorLayout'))
const EditorDashboard = lazy(() => import('@/pages/editor/EditorDashboard'))
const EditorMatches = lazy(() => import('@/pages/editor/EditorMatches'))
const EditorReferees = lazy(() => import('@/pages/editor/EditorReferees'))
const EditorReports = lazy(() => import('@/pages/editor/EditorReports'))

// Viewer
const ViewerLayout = lazy(() => import('@/components/layout/ViewerLayout'))
const ViewerDashboard = lazy(() => import('@/pages/viewer/ViewerDashboard'))
const ViewerMatches = lazy(() => import('@/pages/viewer/ViewerMatches'))
const ViewerReferees = lazy(() => import('@/pages/viewer/ViewerReferees'))
const ViewerFinance = lazy(() => import('@/pages/viewer/ViewerFinance'))
const ViewerReports = lazy(() => import('@/pages/viewer/ViewerReports'))

// ====== Loading ======
function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
    </div>
  )
}

// ====== Protected Route ======
function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading, initialized, error } = useAuthStore()

  if (loading || !initialized) return <PageLoading />
  if (!user) return <Navigate to="/login" replace />

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-3">⚠️ خطأ في البيانات</h2>
          <p className="text-white/70 mb-4">لم يتم العثور على profile للمستخدم</p>
          <p className="text-xs text-white/40 mb-6">{error || 'Profile not found'}</p>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="btn-danger"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-3">🚫 غير مصرح</h2>
          <p className="text-white/70 mb-4">
            دورك: <strong>{profile.role}</strong>
          </p>
          <p className="text-white/70 mb-6">
            مطلوب: <strong>{allowedRoles.join(' / ')}</strong>
          </p>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="btn-danger"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    )
  }

  return children
}

// ====== App ======
export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<TestComponents />} />

        {/* ====== Admin ====== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="referees" element={<Referees />} />
          <Route path="competitions" element={<Competitions />} />
          <Route path="matches" element={<Matches />} />
          <Route path="evaluations" element={<Evaluations />} />
          <Route path="finance" element={<Finance />} />
          <Route path="supervisors" element={<Supervisors />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="notifications" element={<Notifications />} />

        </Route>

        {/* ====== Editor ====== */}
        <Route
          path="/editor"
          element={
            <ProtectedRoute allowedRoles={['editor']}>
              <EditorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/editor/dashboard" replace />} />
          <Route path="dashboard" element={<EditorDashboard />} />
          <Route path="matches" element={<EditorMatches />} />
          <Route path="referees" element={<EditorReferees />} />
          <Route path="reports" element={<EditorReports />} />
          <Route path="notifications" element={<Notifications />} />

        </Route>

        {/* ====== Viewer ====== */}
        <Route
          path="/viewer"
          element={
            <ProtectedRoute allowedRoles={['viewer']}>
              <ViewerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/viewer/dashboard" replace />} />
          <Route path="dashboard" element={<ViewerDashboard />} />
          <Route path="matches" element={<ViewerMatches />} />
          <Route path="referees" element={<ViewerReferees />} />
          <Route path="finance" element={<ViewerFinance />} />
          <Route path="reports" element={<ViewerReports />} />
          <Route path="notifications" element={<Notifications />} />

        </Route>

        {/* ====== Fallback ====== */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}