import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import ImageUploader from './ImageUploader'
import LayoutControls from './LayoutControls'
import SpacingControls from './SpacingControls'
import {
  S, BtnGroup, ColorSwatch, InlineTextField, defaultText, fsMap, padMap, gapMap, VARIANTS,
} from './sectionFormShared'

const defaultHero = () => ({
  heading: { ...defaultText(''), fontSize: 'xl', visible: true },
  subheading: { ...defaultText(''), visible: false },
  paragraphs: [],
  background: { image: null, overlay_opacity: 40, fallback_color: '#111827', focal_point: 'center' },
  layout: { anchor: 'center', text_align: 'center', height: 'large', max_width: 'medium' },
  spacing: { padding: 'md', element_gap: 'md' },
  cta: { text: null, link: null, variant: 'solid', color: null },
})

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
  const h = content.heading
  const sub = content.subheading
  const paras = content.paragraphs
  const bg = content.background
  const lay = content.layout
  const sp = content.spacing
  const cta = content.cta

  const anchorStyles = {
    'top-left': { top: padMap[sp.padding], left: padMap[sp.padding], alignItems: 'flex-start', textAlign: 'left' },
    'top-center': { top: padMap[sp.padding], left: '50%', transform: 'translateX(-50%)', alignItems: 'center', textAlign: 'center' },
    'top-right': { top: padMap[sp.padding], right: padMap[sp.padding], alignItems: 'flex-end', textAlign: 'right' },
    'center-left': { top: '50%', left: padMap[sp.padding], transform: 'translateY(-50%)', alignItems: 'flex-start', textAlign: 'left' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%,-50%)', alignItems: 'center', textAlign: 'center' },
    'center-right': { top: '50%', right: padMap[sp.padding], transform: 'translateY(-50%)', alignItems: 'flex-end', textAlign: 'right' },
    'bottom-left': { bottom: padMap[sp.padding], left: padMap[sp.padding], alignItems: 'flex-start', textAlign: 'left' },
    'bottom-center': { bottom: padMap[sp.padding], left: '50%', transform: 'translateX(-50%)', alignItems: 'center', textAlign: 'center' },
    'bottom-right': { bottom: padMap[sp.padding], right: padMap[sp.padding], alignItems: 'flex-end', textAlign: 'right' },
  }

  const focalMap = { top: 'top center', center: 'center center', bottom: 'bottom center' }
  const aStyle = anchorStyles[lay.anchor] || anchorStyles.center

  return (
    <div style={{
      width: '100%', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden',
      position: 'relative', backgroundColor: bg.fallback_color,
      border: '1px solid var(--color-line)',
    }}>
      {bg.image && (
        <img src={bg.image} alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: focalMap[bg.focal_point] || 'center center',
          }} />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: bg.fallback_color,
        opacity: bg.image ? bg.overlay_opacity / 100 : 1,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', gap: gapMap[sp.element_gap],
        padding: padMap[sp.padding],
        maxWidth: maxWMap[lay.max_width],
        margin: lay.text_align === 'center' ? '0 auto' : lay.text_align === 'right' ? '0 0 0 auto' : '0',
        ...(lay.anchor.includes('top') ? { justifyContent: 'flex-start' } :
          lay.anchor.includes('bottom') ? { justifyContent: 'flex-end' } : { justifyContent: 'center' }),
        ...aStyle,
        position: 'absolute',
      }}>
        {h.visible && h.text && (
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: fsMap[h.fontSize], fontWeight: h.weight || 400,
            color: h.color || '#ffffff', lineHeight: 1.2, textAlign: lay.text_align,
          }}>{h.text}</div>
        )}
        {sub.visible && sub.text && (
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: fsMap[sub.fontSize], fontWeight: sub.weight || 400,
            color: sub.color || 'rgba(255,255,255,0.75)', lineHeight: 1.4, textAlign: lay.text_align,
          }}>{sub.text}</div>
        )}
        {paras.filter(p => p.visible && p.text).map((p, i) => (
          <div key={i} style={{
            fontFamily: 'var(--font-sans)', fontSize: fsMap[p.fontSize], fontWeight: p.weight || 400,
            color: p.color || 'rgba(255,255,255,0.6)', lineHeight: 1.5, textAlign: lay.text_align,
          }}>{p.text}</div>
        ))}
        {cta.text && (
          <div style={{ display: 'flex', justifyContent: lay.text_align === 'left' ? 'flex-start' : lay.text_align === 'right' ? 'flex-end' : 'center', marginTop: 4 }}>
            <div style={{
              padding: '5px 14px', borderRadius: 4, fontFamily: 'var(--font-mono)',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              ...(cta.variant === 'solid' ? { backgroundColor: cta.color || 'var(--color-signal)', color: '#fff' } :
                cta.variant === 'outline' ? { border: `1px solid ${cta.color || 'var(--color-signal)'}`, color: cta.color || 'var(--color-signal)', backgroundColor: 'transparent' } :
                { color: cta.color || 'var(--color-signal)', backgroundColor: 'transparent' }),
            }}>{cta.text}</div>
          </div>
        )}
      </div>
    </div>
  )
}

const maxWMap = { narrow: '400px', medium: '600px', wide: '800px', full: '100%' }

export default function HeroSectionForm({ editing, onSubmit, onClose }) {
  const [content, setContent] = useState(defaultHero)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editing?.content) {
      const c = editing.content
      const migrateText = (t) => {
        const base = defaultText()
        const d = { ...base, ...(t || {}) }
        if (d.bold !== undefined && d.weight === undefined) d.weight = d.bold ? 700 : 400
        delete d.bold
        return d
      }
      setContent({
        heading: migrateText(c.heading),
        subheading: migrateText(c.subheading),
        paragraphs: (c.paragraphs || []).map(p => migrateText(p)),
        background: { image: null, overlay_opacity: 40, fallback_color: '#111827', focal_point: 'center', ...(c.background || {}), image: c.background?.image || c.background_image || null },
        layout: { anchor: 'center', text_align: 'center', height: 'large', max_width: 'medium', ...(c.layout || {}) },
        spacing: { padding: 'md', element_gap: 'md', ...(c.spacing || {}) },
        cta: { text: null, link: null, variant: 'solid', color: null, ...(c.cta || {}) },
      })
    }
    setErrors({})
  }, [editing])

  const update = (path, val) => {
    setContent(prev => {
      const next = { ...prev }
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        if (Array.isArray(obj[keys[i]])) {
          obj[keys[i]] = [...obj[keys[i]]]
          obj = obj[keys[i]]
        } else {
          obj[keys[i]] = { ...obj[keys[i]] }
          obj = obj[keys[i]]
        }
      }
      obj[keys[keys.length - 1]] = val
      return next
    })
  }

  const addParagraph = () => setContent(prev => ({
    ...prev, paragraphs: [...prev.paragraphs, defaultText('')]
  }))

  const removeParagraph = (idx) => setContent(prev => ({
    ...prev, paragraphs: prev.paragraphs.filter((_, i) => i !== idx)
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      await onSubmit({ type: 'hero', content })
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
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-signal)' }}>
                {editing ? 'EDIT HERO' : 'NEW HERO'}
              </h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                <CollapsibleGroup title="Content" defaultOpen={true}>
                  <InlineTextField label="HEADING *" value={content.heading} onChange={(v) => update('heading', v)} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={S.label}>SUBHEADING</label>
                      <button type="button" onClick={() => update('subheading.visible', !content.subheading.visible)}
                        style={{ ...S.btn(content.subheading.visible), fontSize: 8 }}>
                        {content.subheading.visible ? 'VISIBLE' : 'HIDDEN'}
                      </button>
                    </div>
                    {content.subheading.visible && (
                      <InlineTextField label="" value={content.subheading} onChange={(v) => update('subheading', v)} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={S.label}>PARAGRAPHS ({content.paragraphs.length})</label>
                      <button type="button" onClick={addParagraph} style={{ ...S.btn(false), display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Plus size={10} /> ADD
                      </button>
                    </div>
                    {content.paragraphs.map((p, i) => (
                      <div key={i} style={{ marginBottom: 8, position: 'relative' }}>
                        <InlineTextField label={`P${i + 1}`} value={p}
                          onChange={(v) => update(`paragraphs.${i}`, v)} />
                        <button type="button" onClick={() => removeParagraph(i)}
                          style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', color: 'var(--color-denied)', cursor: 'pointer', padding: 2, opacity: 0.5 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </CollapsibleGroup>

                <CollapsibleGroup title="Background">
                  <div>
                    <label style={S.label}>IMAGE</label>
                    <ImageUploader value={content.background.image} onChange={(url) => update('background.image', url || null)} />
                  </div>
                  <div>
                    <label style={S.label}>OVERLAY OPACITY — {content.background.overlay_opacity}%</label>
                    <input type="range" min="0" max="100" value={content.background.overlay_opacity}
                      onChange={(e) => update('background.overlay_opacity', parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--color-signal)' }} />
                  </div>
                  <ColorSwatch label="FALLBACK COLOR" value={content.background.fallback_color} onChange={(v) => update('background.fallback_color', v)} />
                  <div>
                    <label style={S.label}>FOCAL POINT</label>
                    <BtnGroup options={['top', 'center', 'bottom']} value={content.background.focal_point}
                      onChange={(v) => update('background.focal_point', v)} />
                  </div>
                </CollapsibleGroup>

                <CollapsibleGroup title="Layout">
                  <LayoutControls value={content.layout} onChange={(v) => update('layout', v)} />
                </CollapsibleGroup>

                <CollapsibleGroup title="Spacing">
                  <SpacingControls value={content.spacing} onChange={(v) => update('spacing', v)} />
                </CollapsibleGroup>

                <CollapsibleGroup title="CTA">
                  <div>
                    <label style={S.label}>TEXT</label>
                    <input style={S.input} value={content.cta.text || ''} placeholder="View Work"
                      onChange={(e) => update('cta.text', e.target.value || null)} />
                  </div>
                  <div>
                    <label style={S.label}>LINK</label>
                    <input style={S.input} value={content.cta.link || ''} placeholder="/portfolio"
                      onChange={(e) => update('cta.link', e.target.value || null)} />
                  </div>
                  <div>
                    <label style={S.label}>VARIANT</label>
                    <BtnGroup options={VARIANTS} value={content.cta.variant} onChange={(v) => update('cta.variant', v)} />
                  </div>
                  <ColorSwatch label="COLOR" value={content.cta.color} onChange={(v) => update('cta.color', v)} />
                </CollapsibleGroup>
              </div>

              <div style={{ display: 'flex', gap: 10, padding: '14px 0', borderTop: '1px solid var(--color-line)', marginTop: 'auto' }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--color-line)', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>CANCEL</button>
                <button type="submit" style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', backgroundColor: 'var(--color-signal)', color: 'var(--color-void)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>{editing ? 'UPDATE' : 'CREATE'}</button>
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
