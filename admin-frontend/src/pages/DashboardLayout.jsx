import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Layers, Menu, Monitor, Palette, Settings, LogOut, Bell, User, ChevronDown, Search } from 'lucide-react'
import useAuthStore from '../store/authStore'
import SearchPalette from '../components/SearchPalette'

const NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Channels', path: '/dashboard/channels', icon: Monitor },
  { label: 'Menus', path: '/dashboard/menus', icon: Menu },
  { label: 'Navbar Templates', path: '/dashboard/navbar-templates', icon: Palette },
]

function TopBar({ admin, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  const pageTitle = (() => {
    if (location.pathname === '/dashboard') return 'DASHBOARD'
    if (location.pathname.includes('/channels/') && location.pathname.includes('/pages/')) return 'PAGE DETAIL'
    if (location.pathname.includes('/channels/')) return 'CHANNEL DETAIL'
    if (location.pathname.includes('/channels')) return 'CHANNELS'
    if (location.pathname.includes('/menus')) return 'MENUS'
    if (location.pathname.includes('/navbar-templates')) return 'NAVBAR TEMPLATES'
    return 'DASHBOARD'
  })()

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div style={{
      height: 52,
      backgroundColor: 'var(--color-panel)',
      borderBottom: '1px solid var(--color-line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--color-text-muted)' }}>
        {pageTitle}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Search */}
        <button onClick={() => setSearchOpen(true)} style={{
          width: 36, height: 36, borderRadius: 8, border: 'none', backgroundColor: 'transparent',
          color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.12s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.06)'; e.currentTarget.style.color = 'var(--color-text)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          <Search size={16} />
        </button>
        <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            style={{
              width: 36, height: 36, borderRadius: 8, border: 'none', backgroundColor: notifOpen ? 'rgba(62,217,196,0.08)' : 'transparent',
              color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', transition: 'all 0.12s',
            }}
            onMouseEnter={(e) => { if (!notifOpen) { e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.06)'; e.currentTarget.style.color = 'var(--color-text)' } }}
            onMouseLeave={(e) => { if (!notifOpen) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' } }}
          >
            <Bell size={16} />
            <span style={{
              position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%',
              backgroundColor: 'var(--color-signal)', border: '1.5px solid var(--color-panel)',
            }} />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 6,
                  width: 280, backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)',
                  borderRadius: 10, padding: 12, zIndex: 100,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text-muted)', marginBottom: 10 }}>
                  NOTIFICATIONS
                </div>
                <div style={{ padding: 20, textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>No notifications yet</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <button style={{
          width: 36, height: 36, borderRadius: 8, border: 'none', backgroundColor: 'transparent',
          color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.12s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.06)'; e.currentTarget.style.color = 'var(--color-text)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          <Settings size={16} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, backgroundColor: 'var(--color-line)', margin: '0 6px' }} />

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px', borderRadius: 8, border: 'none',
              backgroundColor: profileOpen ? 'rgba(62,217,196,0.08)' : 'transparent',
              color: 'var(--color-text)', cursor: 'pointer', transition: 'all 0.12s',
            }}
            onMouseEnter={(e) => { if (!profileOpen) e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.06)' }}
            onMouseLeave={(e) => { if (!profileOpen) e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: 'rgba(62,217,196,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={14} style={{ color: 'var(--color-signal)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text)' }}>
              {admin?.name || 'Admin'}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--color-text-muted)', transition: 'transform 0.15s', transform: profileOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 6,
                  width: 200, backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)',
                  borderRadius: 10, padding: 6, zIndex: 100,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {admin && (
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-line)', marginBottom: 4 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--color-text)' }}>{admin.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{admin.email}</div>
                  </div>
                )}
                <button
                  onClick={() => { navigate('/dashboard'); setProfileOpen(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 6, border: 'none', backgroundColor: 'transparent', color: 'var(--color-text)',
                    fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.06)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <LayoutDashboard size={14} style={{ color: 'var(--color-text-muted)' }} />
                  Dashboard
                </button>
                <button
                  onClick={() => { navigate('/dashboard/menus'); setProfileOpen(false) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 6, border: 'none', backgroundColor: 'transparent', color: 'var(--color-text)',
                    fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.06)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <Settings size={14} style={{ color: 'var(--color-text-muted)' }} />
                  Settings
                </button>
                <div style={{ height: 1, backgroundColor: 'var(--color-line)', margin: '4px 0' }} />
                <button
                  onClick={() => { setProfileOpen(false); onLogout() }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 6, border: 'none', backgroundColor: 'transparent', color: 'var(--color-denied)',
                    fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(232,84,84,0.06)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const { admin, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    useAuthStore.getState().checkAuth()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-void)' }}>
      <style>{`
        .nav-item { transition: all 0.12s ease; cursor: pointer; }
        .nav-item:hover { background: rgba(62,217,196,0.06); }
        .nav-item.active { background: rgba(62,217,196,0.1); border-right: 2px solid var(--color-signal); }
        .nav-icon { width: 16px; height: 16px; flex-shrink: 0; }
      `}</style>

      <aside
        style={{
          width: collapsed ? 56 : 220,
          backgroundColor: 'var(--color-panel)',
          borderRight: '1px solid var(--color-line)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--color-line)' }}>
          <div className="flex items-center gap-2">
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-signal)', flexShrink: 0 }} />
            {!collapsed && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--color-text)' }}>
                MYPROFOLIO
              </span>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
            return (
              <div
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  color: isActive ? 'var(--color-signal)' : 'var(--color-text-muted)',
                }}
              >
                <item.icon className="nav-icon" />
                {!collapsed && <span>{item.label}</span>}
              </div>
            )
          })}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-line)' }}>
          {!collapsed && admin && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 8 }}>
              {admin.email}
            </div>
          )}
          <div
            className="nav-item"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-denied)',
            }}
          >
            <LogOut className="nav-icon" />
            {!collapsed && <span>LOGOUT</span>}
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar admin={admin} onLogout={handleLogout} />
        <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
