import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight } from 'lucide-react'
import { ICONS } from './IconPicker'
import api from '../api/apiConfig'

function flattenMenu(nodes) {
  const result = []
  for (const node of nodes) {
    result.push(node)
    if (node.children && node.children.length > 0) {
      result.push(...flattenMenu(node.children))
    }
  }
  return result
}

export default function SearchPalette({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIdx(0)
      setLoading(true)
      api.get('/api/v1/menus')
        .then(({ data }) => setMenus(data))
        .catch(() => setMenus([]))
        .finally(() => setLoading(false))
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const flat = useMemo(() => flattenMenu(menus), [menus])

  const results = useMemo(() => {
    if (!query.trim()) return flat.filter((m) => m.route_path)
    const q = query.toLowerCase()
    return flat.filter((m) =>
      m.label.toLowerCase().includes(q) ||
      (m.route_path && m.route_path.toLowerCase().includes(q))
    )
  }, [flat, query])

  useEffect(() => { setSelectedIdx(0) }, [query])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && results[selectedIdx]) { handleSelect(results[selectedIdx]) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, results, selectedIdx])

  const handleSelect = (item) => {
    if (item.route_path) {
      navigate(item.route_path)
    }
    onClose()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(14,16,19,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '15vh', zIndex: 300, padding: 16,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 480,
            backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--color-line)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}
        >
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--color-line)' }}>
            <Search size={16} style={{ color: 'var(--color-signal)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menus, pages, channels..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--color-text)', fontSize: 14, fontFamily: 'var(--font-sans)',
              }}
            />
            <button
              onClick={onClose}
              style={{
                padding: '3px 6px', borderRadius: 4, border: '1px solid var(--color-line)',
                background: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 10,
              }}
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: 6 }}>
            {loading && (
              <div style={{ padding: 20, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>
                Loading...
              </div>
            )}

            {!loading && results.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>
                {query ? 'No results found' : 'No menu items with routes'}
              </div>
            )}

            {!loading && results.map((item, i) => {
              const Icon = item.icon ? ICONS[item.icon] : null
              const isSelected = i === selectedIdx
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIdx(i)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(62,217,196,0.08)' : 'transparent',
                    transition: 'background-color 0.08s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {Icon ? (
                      <Icon size={14} style={{ color: 'var(--color-signal)', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: 'var(--color-line)', flexShrink: 0 }} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </div>
                      {item.route_path && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.route_path}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && item.route_path && (
                    <ArrowRight size={12} style={{ color: 'var(--color-signal)', flexShrink: 0 }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '8px 18px', borderTop: '1px solid var(--color-line)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ padding: '1px 5px', borderRadius: 3, border: '1px solid var(--color-line)', fontSize: 9 }}>↑↓</span>
              navigate
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ padding: '1px 5px', borderRadius: 3, border: '1px solid var(--color-line)', fontSize: 9 }}>↵</span>
              select
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ padding: '1px 5px', borderRadius: 3, border: '1px solid var(--color-line)', fontSize: 9 }}>esc</span>
              close
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
