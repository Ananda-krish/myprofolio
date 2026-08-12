import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function PageForm({ editing, onSubmit, onClose }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('draft')
  const [slugEdited, setSlugEdited] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '')
      setSlug(editing.slug || '')
      setStatus(editing.status || 'draft')
      setSlugEdited(true)
    } else {
      setTitle('')
      setSlug('')
      setStatus('draft')
      setSlugEdited(false)
    }
    setErrors({})
  }, [editing])

  const handleTitleChange = (val) => {
    setTitle(val)
    if (!slugEdited) {
      setSlug(toSlug(val))
    }
  }

  const handleSlugChange = (val) => {
    setSlugEdited(true)
    setSlug(val)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      await onSubmit({ title, slug: slug || null, status })
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      }
    }
  }

  const fieldStyle = (field) => ({
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--color-void)',
    border: `1px solid ${errors[field] ? 'var(--color-denied)' : 'var(--color-line)'}`,
    borderRadius: 8,
    color: 'var(--color-text)',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'border-color 0.12s',
  })

  const labelStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
    marginBottom: 6,
    display: 'block',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(14,16,19,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--color-line)',
            borderRadius: 12,
            padding: 28,
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <X size={16} />
          </button>

          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-signal)', marginBottom: 24 }}>
            {editing ? 'EDIT PAGE' : 'NEW PAGE'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>TITLE *</label>
              <input
                style={fieldStyle('title')}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="Home"
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-signal)' }}
                onBlur={(e) => { e.target.style.borderColor = errors.title ? 'var(--color-denied)' : 'var(--color-line)' }}
              />
              {errors.title && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-denied)', marginTop: 4, display: 'block' }}>
                  {errors.title[0]}
                </span>
              )}
            </div>

            <div>
              <label style={labelStyle}>SLUG</label>
              <input
                style={fieldStyle('slug')}
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="home"
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-signal)' }}
                onBlur={(e) => { e.target.style.borderColor = errors.slug ? 'var(--color-denied)' : 'var(--color-line)' }}
              />
              {errors.slug && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-denied)', marginTop: 4, display: 'block' }}>
                  {errors.slug[0]}
                </span>
              )}
            </div>

            <div>
              <label style={labelStyle}>STATUS</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['draft', 'published'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 8,
                      border: `1px solid ${status === s ? (s === 'published' ? 'var(--color-live)' : 'var(--color-signal)') : 'var(--color-line)'}`,
                      backgroundColor: status === s
                        ? (s === 'published' ? 'rgba(127,216,88,0.1)' : 'rgba(62,217,196,0.1)')
                        : 'transparent',
                      color: status === s
                        ? (s === 'published' ? 'var(--color-live)' : 'var(--color-signal)')
                        : 'var(--color-text-muted)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--color-line)', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>
                CANCEL
              </button>
              <button type="submit" style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', backgroundColor: 'var(--color-signal)', color: 'var(--color-void)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>
                {editing ? 'UPDATE' : 'CREATE'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
