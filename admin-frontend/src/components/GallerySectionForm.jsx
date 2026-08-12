import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import ImageUploader from './ImageUploader'
import SpacingControls from './SpacingControls'
import { S, BtnGroup, maxWMap, gapMap } from './sectionFormShared'

const HEIGHTS = ['full', 'large', 'medium', 'auto']
const COLUMNSS = [2, 3, 4]
const ASPECT_RATIOS = ['square', 'landscape', 'original']

const defaultGalleryContent = () => ({
  images: [{ url: '', caption: '' }],
  layout: { height: 'large', max_width: 'full' },
  spacing: { padding: 'md', element_gap: 'md' },
  grid: { columns: 3, aspect_ratio: 'square' },
})

const arMap = { square: '1/1', landscape: '16/9', original: 'auto' }

function CollapsibleGroup({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid var(--color-line)' }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={S.groupTitle}>{title}</span>
        {open ? <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LivePreview({ content }) {
  const imgs = content.images.filter(i => i.url)
  const cols = content.grid.columns
  const ar = content.grid.aspect_ratio
  const gap = gapMap[content.spacing.element_gap]

  if (imgs.length === 0) {
    return (
      <div style={{
        width: '100%', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden',
        border: '1px solid var(--color-line)', backgroundColor: '#111827',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>
          NO IMAGES
        </span>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden',
      border: '1px solid var(--color-line)', backgroundColor: '#111827',
      padding: gap,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
        height: '100%',
      }}>
        {imgs.map((img, i) => (
          <div key={i} style={{
            borderRadius: 4, overflow: 'hidden',
            aspectRatio: arMap[ar],
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}>
            {img.url ? (
              <img src={img.url} alt={img.caption || ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--color-text-muted)' }}>EMPTY</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GallerySectionForm({ editing, onSubmit, onClose }) {
  const [content, setContent] = useState(defaultGalleryContent)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editing?.content) {
      const c = editing.content
      const images = (c.images || []).map(img => ({
        url: img.url || '',
        caption: img.caption || '',
      }))
      setContent({
        images: images.length > 0 ? images : [{ url: '', caption: '' }],
        layout: { height: 'large', max_width: 'full', ...(c.layout || {}) },
        spacing: { padding: 'md', element_gap: 'md', ...(c.spacing || {}) },
        grid: { columns: 3, aspect_ratio: 'square', ...(c.grid || {}) },
      })
    }
    setErrors({})
  }, [editing])

  const updateImage = (idx, field, val) => {
    setContent(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === idx ? { ...img, [field]: val } : img),
    }))
  }

  const addImage = () => setContent(prev => ({
    ...prev,
    images: [...prev.images, { url: '', caption: '' }],
  }))

  const removeImage = (idx) => {
    if (content.images.length <= 1) return
    setContent(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    const cleaned = content.images.filter(img => img.url.trim())
    if (cleaned.length === 0) {
      setErrors({ images: ['At least one image is required.'] })
      return
    }
    try {
      await onSubmit({ type: 'gallery', content: { ...content, images: cleaned } })
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
    }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(14,16,19,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 12 }}
        onClick={onClose}
      >
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 1000, height: '90vh', backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 12, display: 'flex', overflow: 'hidden' }}
        >
          {/* LEFT: Form */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: '#F59E0B' }}>
                {editing ? 'EDIT GALLERY' : 'NEW GALLERY'}
              </h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {errors.images && (
                  <div style={{ padding: '8px 12px', marginBottom: 8, borderRadius: 6, backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-denied)' }}>{errors.images[0]}</span>
                  </div>
                )}

                <CollapsibleGroup title={`Images (${content.images.filter(i => i.url).length})`} defaultOpen={true}>
                  {content.images.map((img, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <ImageUploader
                          value={img.url}
                          onChange={(url) => updateImage(idx, 'url', url || '')}
                        />
                        <input
                          style={S.input}
                          value={img.caption}
                          onChange={(e) => updateImage(idx, 'caption', e.target.value)}
                          placeholder="Caption (optional)"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        disabled={content.images.length <= 1}
                        style={{
                          width: 34, height: 34, borderRadius: 8, border: '1px solid var(--color-line)',
                          backgroundColor: 'transparent', color: content.images.length <= 1 ? 'var(--color-line)' : 'var(--color-denied)',
                          cursor: content.images.length <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 1,
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImage}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '10px 0', borderRadius: 8, border: '1px dashed var(--color-line)',
                      backgroundColor: 'transparent', color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                      letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.12s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.color = '#F59E0B' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-line)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
                  >
                    <Plus size={14} /> ADD IMAGE
                  </button>
                </CollapsibleGroup>

                <CollapsibleGroup title="Grid">
                  <div>
                    <label style={S.label}>COLUMNS</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {COLUMNSS.map((c) => (
                        <button key={c} type="button" onClick={() => setContent(prev => ({ ...prev, grid: { ...prev.grid, columns: c } }))}
                          style={S.btn(content.grid.columns === c)}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={S.label}>ASPECT RATIO</label>
                    <BtnGroup options={ASPECT_RATIOS} value={content.grid.aspect_ratio}
                      onChange={(v) => setContent(prev => ({ ...prev, grid: { ...prev.grid, aspect_ratio: v } }))} />
                  </div>
                </CollapsibleGroup>

                <CollapsibleGroup title="Layout">
                  <div>
                    <label style={S.label}>HEIGHT</label>
                    <BtnGroup options={HEIGHTS} value={content.layout.height}
                      onChange={(v) => setContent(prev => ({ ...prev, layout: { ...prev.layout, height: v } }))} />
                  </div>
                  <div>
                    <label style={S.label}>MAX WIDTH</label>
                    <BtnGroup options={['narrow', 'medium', 'wide', 'full']} value={content.layout.max_width}
                      onChange={(v) => setContent(prev => ({ ...prev, layout: { ...prev.layout, max_width: v } }))} />
                  </div>
                </CollapsibleGroup>

                <CollapsibleGroup title="Spacing">
                  <SpacingControls value={content.spacing}
                    onChange={(v) => setContent(prev => ({ ...prev, spacing: v }))} />
                </CollapsibleGroup>
              </div>

              <div style={{ display: 'flex', gap: 10, padding: '14px 0', borderTop: '1px solid var(--color-line)', marginTop: 'auto' }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--color-line)', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>CANCEL</button>
                <button type="submit" style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', backgroundColor: '#F59E0B', color: '#000', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>{editing ? 'UPDATE' : 'CREATE'}</button>
              </div>
            </form>
          </div>

          {/* RIGHT: Live Preview */}
          <div style={{ width: 380, borderLeft: '1px solid var(--color-line)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-void)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-line)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                LIVE PREVIEW
              </span>
            </div>
            <div style={{ flex: 1, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LivePreview content={content} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
