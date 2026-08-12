import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useAuthStore from './store/authStore'
import Login from './pages/Login'
import DashboardLayout from './pages/DashboardLayout'
import MenusPage from './pages/MenusPage'
import ChannelsPage from './pages/ChannelsPage'
import ChannelDetail from './pages/ChannelDetail'
import PageDetail from './pages/PageDetail'
import NavbarTemplatesPage from './pages/NavbarTemplatesPage'

const queryClient = new QueryClient()

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<div style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Select a section from the sidebar.</div>} />
            <Route path="menus" element={<MenusPage />} />
            <Route path="channels" element={<ChannelsPage />} />
            <Route path="channels/:id" element={<ChannelDetail />} />
            <Route path="channels/:id/pages/:pageId" element={<PageDetail />} />
            <Route path="navbar-templates" element={<NavbarTemplatesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
