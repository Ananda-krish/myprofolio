import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Palette } from 'lucide-react'
import { useNavbarTemplates, useDeleteNavbarTemplate } from '../api/navbarTemplateHooks'
import NavbarTemplateForm from '../components/NavbarTemplateForm'

function TemplateCard({ template, onEdit, onDelete }) {
  const cfg = template.config || {}
  const bg = cfg.background || {}
  const height = cfg.height || {}
  const colors = cfg.colors || {}

  const bgStyle = bg.style === 'glass'
    ? `rgba(10,10,12,${(bg.opacity || 60) / 100})`
    : bg.style === 'transparent'
      ? 'transparent'
      : bg.color || '#0a0a0c'

  const navHeight = height.mode === 'compact' ? 48 : height.mode === 'tall' ? 80 : height.mode === 'blade' ? (height.base_px || 52) : 64

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: 'var(--color-panel)',
        border: '1px solid var(--color-line)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '0 0 8px' }}>
        <div style={{
          width: '100%',
          height: 100,
          backgroundColor: '#111827',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            width: '100%',
            height: navHeight,
            backgroundColor: bgStyle,
            backdropFilter: bg.style === 'glass' ? 'blur(12px)' : 'none',
            borderBottom: bg.style !== 'transparent' ? '1px solid rgba(255,255,255,0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 12,
          }}>
            <div style={{
              width: 28, height: 6, borderRadius: 3,
              backgroundColor: colors.text_active || '#3ED9C4',
            }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  width: 24, height: 4, borderRadius: 2,
                  backgroundColor: colors.text || '#d1d5db',
                  opacity: 0.5,
                }} />
              ))}
            </div>
          </div>
          {cfg.secondary_layer?.enabled && (
            <div style={{
              width: '100%', height: 20,
              backgroundColor: cfg.secondary_layer.background_color || '#111827',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ width: 40, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)' }} />
            </div>
          )}
          <div style={{ flex: 1, background: 'linear-gradient(180deg, rgba(30,30,36,0.3) 0%, rgba(30,30,36,0) 100%)' }} />
        </div>
      </div>

      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--color-text)' }}>
            {template.name}
          </span>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 4,
            backgroundColor: 'rgba(62,217,196,0.08)',
          }}>
            <Palette size={10} style={{ color: 'var(--color-signal)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, color: 'var(--color-signal)', letterSpacing: '0.06em' }}>
              {bg.style?.toUpperCase() || 'SOLID'} · {height.mode?.toUpperCase() || 'NORMAL'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(template)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            padding: '6px 0', borderRadius: 6, border: '1px solid var(--color-line)',
            backgroundColor: 'transparent', color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
            cursor: 'pointer',
          }}>
            <Pencil size={11} /> EDIT
          </button>
          <button onClick={() => onDelete(template)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-line)',
            backgroundColor: 'transparent', color: 'var(--color-text-muted)',
            cursor: 'pointer',
          }}>
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function NavbarTemplatesPage() {
  const navigate = useNavigate()
  const { data: templates, isLoading } = useNavbarTemplates()
  const deleteTemplate = useDeleteNavbarTemplate()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const handleEdit = (t) => { setEditing(t); setShowForm(true) }
  const handleDelete = async () => { if (!deleting) return; await deleteTemplate.mutateAsync(deleting.id); setDeleting(null) }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Palette size={16} style={{ color: 'var(--color-signal)' }} />
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--color-text)' }}>
            NAVBAR TEMPLATES {templates ? `(${templates.length})` : ''}
          </h1>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
          border: 'none', backgroundColor: 'var(--color-signal)', color: 'var(--color-void)',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer',
        }}>
          <Plus size={12} /> NEW TEMPLATE
        </button>
      </div>

      {isLoading && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', padding: 20 }}>Loading templates...</div>}

      {templates && templates.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', border: '1px dashed var(--color-line)', borderRadius: 12 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>No templates yet. Create one to get started.</p>
        </div>
      )}

      {templates && templates.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} onEdit={handleEdit} onDelete={(t) => setDeleting(t)} />
          ))}
        </div>
      )}

      {showForm && <NavbarTemplateForm editing={editing} onClose={() => { setShowForm(false); setEditing(null) }} />}

      <AnimatePresence>
        {deleting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(14,16,19,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              style={{ width: '100%', maxWidth: 380, backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 12, padding: 28, textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-denied)', marginBottom: 12 }}>DELETE TEMPLATE</h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 24 }}>
                Remove <span style={{ color: 'var(--color-text)' }}>{deleting.name}</span>? Channels using it will fall back to defaults.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setDeleting(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--color-line)', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>CANCEL</button>
                <button onClick={handleDelete} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', backgroundColor: 'var(--color-denied)', color: 'white', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>DELETE</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
