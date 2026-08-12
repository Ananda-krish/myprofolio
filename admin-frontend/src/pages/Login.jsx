import { useState, useEffect, Suspense, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import KineticText from '../components/KineticText'

const StatusOrb = lazy(() => import('../components/StatusOrb'))

const CHANNELS = [
  { domain: 'alex-studio.com', status: 'live' },
  { domain: 'nova-events.sa', status: 'live' },
  { domain: 'reef-bahrain.io', status: 'draft' },
]

function CornerBrackets() {
  const s = { width: 18, height: 18, borderColor: 'var(--color-line-strong)' }
  return (
    <>
      <span className="absolute" style={{ ...s, top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderTopStyle: 'solid', borderLeftStyle: 'solid' }} />
      <span className="absolute" style={{ ...s, top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderTopStyle: 'solid', borderRightStyle: 'solid' }} />
      <span className="absolute" style={{ ...s, bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomStyle: 'solid', borderLeftStyle: 'solid' }} />
      <span className="absolute" style={{ ...s, bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderBottomStyle: 'solid', borderRightStyle: 'solid' }} />
    </>
  )
}

function ChannelCard({ domain, status, index }) {
  const isLive = status === 'live'

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.45 + index * 0.08 }}
      className="flex items-center justify-between cursor-default transition-all duration-100"
      style={{
        backgroundColor: 'var(--color-panel)',
        border: '1px solid var(--color-line)',
        borderRadius: 8,
        padding: '12px 16px',
      }}
      whileHover={{
        borderColor: 'var(--color-line-strong)',
        x: -2,
        transition: { duration: 0.1, ease: 'easeOut' },
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: isLive ? 'var(--color-live)' : 'var(--color-text-muted)' }}
        />
        <span
          className="text-sm tracking-wide"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}
        >
          {domain}
        </span>
      </div>
      <span
        className="text-[10px] font-semibold tracking-[0.14em] uppercase"
        style={{
          fontFamily: 'var(--font-mono)',
          color: isLive ? 'var(--color-signal)' : 'var(--color-text-muted)',
        }}
      >
        {isLive ? 'LIVE' : 'DRAFT'}
      </span>
    </motion.div>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="24 12" />
    </svg>
  )
}

function StatusLine({ phase, errorMessage }) {
  const labels = {
    ready: { text: 'SYSTEM READY', color: 'var(--color-signal)' },
    authenticating: { text: 'AUTHENTICATING\u2026', color: 'var(--color-signal)' },
    granted: { text: 'ACCESS GRANTED', color: 'var(--color-signal)' },
    denied: { text: errorMessage || 'ACCESS DENIED \u2014 check credentials', color: 'var(--color-denied)' },
  }

  const { text, color } = labels[phase] || labels.ready

  return (
    <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)', marginBottom: phase === 'denied' ? 12 : 24 }}>
      <motion.span
        key={phase}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{
          backgroundColor: color,
          ...(phase === 'authenticating'
            ? { animation: 'pulse-dot 1.2s ease-in-out infinite' }
            : {}),
        }}
      />
      <KineticText
        text={text}
        color={color}
        className="text-xs tracking-[0.12em] font-medium"
      />
    </div>
  )
}

function OrbFallback() {
  return (
    <div
      style={{
        width: 160,
        height: 160,
        borderRadius: '50%',
        backgroundColor: 'var(--color-line)',
        opacity: 0.3,
      }}
    />
  )
}

export default function Login() {
  const { login, isLoading, admin, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phase, setPhase] = useState('ready')
  const [errorMessage, setErrorMessage] = useState('')
  const [shake, setShake] = useState(false)
  const [bracketsReady, setBracketsReady] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setBracketsReady(true), 150)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    useAuthStore.getState().checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      const t = setTimeout(() => navigate('/dashboard', { replace: true }), 800)
      return () => clearTimeout(t)
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPhase('authenticating')
    setErrorMessage('')

    const result = await login(email, password)

    if (result.success) {
      setPhase('granted')
    } else {
      setPhase('denied')
      setErrorMessage(result.message)
      setShake(true)
      setTimeout(() => setShake(false), 450)
    }
  }

  const liveCount = CHANNELS.filter((c) => c.status === 'live').length

  const orbState = phase === 'authenticating' ? 'trying' : phase === 'granted' ? 'success' : phase === 'denied' ? 'error' : 'idle'

  if (isAuthenticated && admin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: 'var(--color-void)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-sm"
          style={{
            backgroundColor: 'rgba(20,22,26,0.6)',
            backdropFilter: 'blur(2px)',
            border: '1px solid var(--color-line)',
            borderRadius: 12,
            padding: 32,
          }}
        >
          <CornerBrackets />
          <div className="flex items-center gap-2 mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-signal)' }} />
            <KineticText text="ACCESS GRANTED" color="var(--color-signal)" className="text-xs tracking-[0.12em] font-medium" />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            Logged in as <span className="font-medium">{admin.name}</span>
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes shake-panel {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-4px); }
          30% { transform: translateX(4px); }
          45% { transform: translateX(-3px); }
          60% { transform: translateX(2px); }
          75% { transform: translateX(-1px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="w-full max-w-[900px]"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 0,
        }}
      >
        {/* ─── TWO-PANEL GRID ─── */}
        <style>{`
          @media (min-width: 768px) {
            .login-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
        <div className="login-grid" style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
          {/* ─── LEFT: Channels Ticker ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col justify-center"
            style={{
              padding: '32px 40px',
              borderRight: '1px solid var(--color-line)',
              borderBottom: '1px solid var(--color-line)',
              borderRadius: '12px 0 0 12px',
            }}
          >
            <h2
              className="text-[11px] font-semibold tracking-[0.18em] uppercase"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: 24 }}
            >
              MYPROFOLIO / CHANNELS
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CHANNELS.map((ch, i) => (
                <ChannelCard key={ch.domain} domain={ch.domain} status={ch.status} index={i} />
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.75 }}
              className="text-[11px] tracking-[0.1em]"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginTop: 20 }}
            >
              {CHANNELS.length} channels · {liveCount} broadcasting
            </motion.p>
          </motion.div>

          {/* ─── RIGHT: Login Panel ─── */}
          <div
            className="flex items-center justify-center"
            style={{ padding: '32px 40px' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{
                opacity: bracketsReady ? 1 : 0,
                scale: bracketsReady ? 1 : 0.97,
              }}
              transition={{ duration: 0.35 }}
              className="relative w-full"
              style={{
                maxWidth: 340,
                backgroundColor: 'rgba(20,22,26,0.6)',
                backdropFilter: 'blur(2px)',
                border: '1px solid var(--color-line)',
                borderRadius: 12,
                padding: 32,
                overflow: 'visible',
                ...(shake ? { animation: 'shake-panel 0.45s ease-out' } : {}),
              }}
            >
              <CornerBrackets />

              {/* 3D Orb */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, overflow: 'visible' }}>
                <Suspense fallback={<OrbFallback />}>
                  <StatusOrb state={orbState} />
                </Suspense>
              </div>

              <StatusLine phase={phase} errorMessage={errorMessage} />

              <AnimatePresence mode="wait">
                {phase !== 'granted' ? (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                  >
                    {/* Email field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <label
                        className="text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors duration-150"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: focusedField === 'email' ? 'var(--color-signal)' : 'var(--color-text-muted)',
                        }}
                        htmlFor="email"
                      >
                        EMAIL
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full text-[15px] outline-none transition-all duration-150"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          backgroundColor: 'transparent',
                          color: 'var(--color-text)',
                          padding: '12px 0',
                          borderBottom: `2px solid ${focusedField === 'email' ? 'var(--color-signal)' : 'var(--color-line)'}`,
                          borderRadius: 0,
                        }}
                        placeholder="admin@myprofolio.test"
                      />
                    </div>

                    {/* Password field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <label
                        className="text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors duration-150"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: focusedField === 'password' ? 'var(--color-signal)' : 'var(--color-text-muted)',
                        }}
                        htmlFor="password"
                      >
                        PASSWORD
                      </label>
                      <input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full text-[15px] outline-none transition-all duration-150"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          backgroundColor: 'transparent',
                          color: 'var(--color-text)',
                          padding: '12px 0',
                          borderBottom: `2px solid ${focusedField === 'password' ? 'var(--color-signal)' : 'var(--color-line)'}`,
                          borderRadius: 0,
                        }}
                        placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full text-xs font-semibold tracking-[0.08em] uppercase transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: 'var(--color-signal)',
                        color: 'var(--color-void)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '14px 0',
                        marginTop: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-signal-bright)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-signal)' }}
                    >
                      {isLoading && <SpinnerIcon />}
                      {isLoading ? 'AUTHENTICATING' : 'AUTHENTICATE \u2192'}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="granted"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                      Logged in as <span className="font-medium">{admin?.name}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
