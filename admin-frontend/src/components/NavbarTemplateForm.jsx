import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'
import { useCreateNavbarTemplate, useUpdateNavbarTemplate } from '../api/navbarTemplateHooks'
import ImageUploader from './ImageUploader'

const defaultConfig = {
  background: { style: 'solid', color: '#0a0a0c', opacity: 100 },
  height: { left_px: 64, center_px: 64, right_px: 64, blade_enabled: false, blade_expanded_px: 96 },
  position: 'top',
  logo: { url: null, position: 'left', size: 36 },
  colors: { text: '#d1d5db', text_hover: '#3ED9C4', text_active: '#3ED9C4', background_scrolled: null },
  hover_effect: 'underline',
  secondary_layer: { enabled: false, background_color: '#111827', content_type: 'text', text: null, links: null },
  search: { enabled: false, placeholder: 'Search...' },
  below_navbar_carousel: { enabled: false, autoplay_ms: 4000, items: [] },
}

function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid var(--color-line)' }}>
      <button type="button" onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text-muted)' }}>{title}</span>
        <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && <div style={{ paddingBottom: 16 }}>{children}</div>}
    </div>
  )
}

function BtnGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map((opt) => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)} style={{
          flex: 1, padding: '7px 0', borderRadius: 6,
          border: `1px solid ${value === opt.value ? 'var(--color-signal)' : 'var(--color-line)'}`,
          backgroundColor: value === opt.value ? 'rgba(62,217,196,0.12)' : 'transparent',
          color: value === opt.value ? 'var(--color-signal)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em',
          cursor: 'pointer', transition: 'all 0.12s',
        }}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', minWidth: 100 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)}
          style={{ width: 28, height: 28, border: '1px solid var(--color-line)', borderRadius: 6, cursor: 'pointer', backgroundColor: 'transparent', padding: 0 }} />
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, padding: '6px 8px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 11, fontFamily: 'var(--font-mono)', outline: 'none' }} />
      </div>
    </div>
  )
}

function LivePreview({ config }) {
  const bg = config.background || {}
  const ht = config.height || {}
  const colors = config.colors || {}
  const sec = config.secondary_layer || {}
  const search = config.search || {}
  const carousel = config.below_navbar_carousel || {}
  const logo = config.logo || {}

  const bgResolved = bg.style === 'glass'
    ? `rgba(10,10,12,${(bg.opacity || 60) / 100})`
    : bg.style === 'transparent' ? 'transparent' : bg.color || '#0a0a0c'

  const leftH = Math.min(ht.left_px || 64, 56)
  const centerH = Math.min(ht.center_px || 64, 56)
  const rightH = Math.min(ht.right_px || 64, 56)
  const logoSz = Math.min((logo.size || 36) * 0.55, 22)

  const maxH = Math.max(leftH, centerH, rightH)

  return (
    <div style={{ backgroundColor: '#111827', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-line)' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', backgroundColor: bgResolved,
        backdropFilter: bg.style === 'glass' ? 'blur(12px)' : 'none',
        borderBottom: bg.style !== 'transparent' ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}>
        <div style={{ width: '30%', height: leftH, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', borderRight: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {logo.url ? (
            <img src={logo.url} alt="" style={{ height: logoSz, width: logoSz, objectFit: 'contain', borderRadius: 3 }} />
          ) : (
            <div style={{ width: logoSz, height: 5, borderRadius: 3, backgroundColor: colors.text_active || '#3ED9C4' }} />
          )}
        </div>
        <div style={{ width: '40%', height: centerH, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRight: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {['HOME', 'WORK', 'ABOUT'].map((l, i) => (
            <span key={l} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 8, fontWeight: 600, letterSpacing: '0.06em', color: i === 0 ? (colors.text_active || '#3ED9C4') : (colors.text || '#d1d5db') }}>{l}</span>
          ))}
        </div>
        <div style={{ width: '30%', height: rightH, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', flexShrink: 0 }}>
          {search.enabled && (
            <div style={{ padding: '3px 8px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.12)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
              {search.placeholder || 'Search...'}
            </div>
          )}
        </div>
      </div>
      {sec.enabled && (
        <div style={{ height: 16, backgroundColor: sec.background_color || '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 6, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>
            {sec.content_type === 'links' ? 'LINK 1 · LINK 2' : (sec.text || 'secondary')}
          </span>
        </div>
      )}
      {carousel.enabled && carousel.items?.length > 0 && (
        <div style={{ height: 24, backgroundColor: '#0a0a0c', display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', overflow: 'hidden' }}>
          {carousel.items.slice(0, 2).map((item, i) => (
            <div key={i} style={{ height: 16, width: 40, borderRadius: 2, overflow: 'hidden', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.05)' }}>
              {item.image_url && <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
          ))}
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 6, color: 'rgba(255,255,255,0.2)' }}>carousel</span>
        </div>
      )}
      <div style={{ height: 40, background: 'linear-gradient(180deg, rgba(40,40,48,0.15) 0%, transparent 100%)' }} />
    </div>
  )
}

export default function NavbarTemplateForm({ editing, onClose }) {
  const createTemplate = useCreateNavbarTemplate()
  const updateTemplate = useUpdateNavbarTemplate()
  const [name, setName] = useState('')
  const [config, setConfig] = useState(defaultConfig)

  useEffect(() => {
    if (editing) {
      setName(editing.name || '')
      const merged = {}
      for (const key of Object.keys(defaultConfig)) {
        if (editing.config?.[key] && typeof defaultConfig[key] === 'object' && !Array.isArray(defaultConfig[key])) {
          merged[key] = { ...defaultConfig[key], ...editing.config[key] }
        } else {
          merged[key] = editing.config?.[key] ?? defaultConfig[key]
        }
      }
      setConfig(merged)
    }
  }, [editing])

  const updateConfig = (path, value) => {
    setConfig((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) { obj = obj[keys[i]] }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { name, config }
    if (editing) {
      await updateTemplate.mutateAsync({ id: editing.id, ...payload })
    } else {
      await createTemplate.mutateAsync(payload)
    }
    onClose()
  }

  const saving = createTemplate.isPending || updateTemplate.isPending

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(14,16,19,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
        style={{
          width: '100%', maxWidth: 900, maxHeight: '90vh', backgroundColor: 'var(--color-panel)',
          border: '1px solid var(--color-line)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--color-line)' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-signal)' }}>
            {editing ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12, borderRight: '1px solid var(--color-line)' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>NAME</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="My Template"
                style={{ width: '100%', padding: '8px 10px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none' }} />
            </div>

            <Collapsible title="BACKGROUND" defaultOpen>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <BtnGroup options={[{ value: 'solid', label: 'SOLID' }, { value: 'glass', label: 'GLASS' }, { value: 'transparent', label: 'NONE' }]}
                  value={config.background.style} onChange={(v) => updateConfig('background.style', v)} />
                {config.background.style !== 'transparent' && (
                  <>
                    <ColorField label="Color" value={config.background.color} onChange={(v) => updateConfig('background.color', v)} />
                    {config.background.style === 'glass' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>Opacity</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text)' }}>{config.background.opacity}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={config.background.opacity} onChange={(e) => updateConfig('background.opacity', parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-signal)' }} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </Collapsible>

            <Collapsible title="HEIGHT" defaultOpen>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { key: 'left_px', label: 'LEFT' },
                    { key: 'center_px', label: 'CENTER' },
                    { key: 'right_px', label: 'RIGHT' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>{label}</label>
                      <input type="range" min="32" max="120" value={config.height[key]} onChange={(e) => updateConfig(`height.${key}`, parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-signal)', marginBottom: 6 }} />
                      <input type="number" min="32" max="120" value={config.height[key]} onChange={(e) => updateConfig(`height.${key}`, parseInt(e.target.value) || 64)}
                        style={{ width: '100%', padding: '6px 8px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none', textAlign: 'center', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>BLADE ON HOVER</span>
                  <button type="button" onClick={() => updateConfig('height.blade_enabled', !config.height.blade_enabled)}
                    style={{ width: 36, height: 20, borderRadius: 10, border: 'none', backgroundColor: config.height.blade_enabled ? 'var(--color-signal)' : 'var(--color-line)', cursor: 'pointer', position: 'relative', transition: 'background-color 0.15s' }}>
                    <span style={{ position: 'absolute', top: 2, left: config.height.blade_enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.15s' }} />
                  </button>
                </div>
                {config.height.blade_enabled && (
                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>EXPANDED PX</label>
                    <input type="number" min="48" max="160" value={config.height.blade_expanded_px} onChange={(e) => updateConfig('height.blade_expanded_px', parseInt(e.target.value) || 96)}
                      style={{ width: '100%', padding: '6px 8px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 11, fontFamily: 'var(--font-mono)', outline: 'none' }} />
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 4 }}>Each zone expands independently on hover.</p>
                  </div>
                )}
              </div>
            </Collapsible>

            <Collapsible title="POSITION">
              <BtnGroup options={[{ value: 'top', label: 'TOP BAR' }, { value: 'left', label: 'LEFT SIDEBAR' }]}
                value={config.position} onChange={(v) => updateConfig('position', v)} />
            </Collapsible>

            <Collapsible title="LOGO" defaultOpen>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ImageUploader value={config.logo.url} onChange={(v) => updateConfig('logo.url', v)} />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>Size</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text)' }}>{config.logo.size || 36}px</span>
                  </div>
                  <input type="range" min="20" max="80" value={config.logo.size || 36} onChange={(e) => updateConfig('logo.size', parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-signal)' }} />
                </div>
                <BtnGroup options={[{ value: 'left', label: 'LEFT' }, { value: 'center', label: 'CENTER' }, { value: 'right', label: 'RIGHT' }]}
                  value={config.logo.position} onChange={(v) => updateConfig('logo.position', v)} />
              </div>
            </Collapsible>

            <Collapsible title="COLORS">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ColorField label="Text" value={config.colors.text} onChange={(v) => updateConfig('colors.text', v)} />
                <ColorField label="Hover" value={config.colors.text_hover} onChange={(v) => updateConfig('colors.text_hover', v)} />
                <ColorField label="Active" value={config.colors.text_active} onChange={(v) => updateConfig('colors.text_active', v)} />
                <ColorField label="Scrolled BG" value={config.colors.background_scrolled || ''} onChange={(v) => updateConfig('colors.background_scrolled', v || null)} />
              </div>
            </Collapsible>

            <Collapsible title="HOVER EFFECT">
              <BtnGroup options={[{ value: 'underline', label: 'UNDERLINE' }, { value: 'glow', label: 'GLOW' }, { value: 'scale', label: 'SCALE' }, { value: 'background-fill', label: 'FILL' }]}
                value={config.hover_effect} onChange={(v) => updateConfig('hover_effect', v)} />
            </Collapsible>

            <Collapsible title="SECONDARY LAYER">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>ENABLED</span>
                  <button type="button" onClick={() => updateConfig('secondary_layer.enabled', !config.secondary_layer.enabled)}
                    style={{ width: 36, height: 20, borderRadius: 10, border: 'none', backgroundColor: config.secondary_layer.enabled ? 'var(--color-signal)' : 'var(--color-line)', cursor: 'pointer', position: 'relative', transition: 'background-color 0.15s' }}>
                    <span style={{ position: 'absolute', top: 2, left: config.secondary_layer.enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.15s' }} />
                  </button>
                </div>
                {config.secondary_layer.enabled && (
                  <>
                    <ColorField label="BG Color" value={config.secondary_layer.background_color} onChange={(v) => updateConfig('secondary_layer.background_color', v)} />
                    <BtnGroup options={[{ value: 'text', label: 'TEXT' }, { value: 'links', label: 'LINKS' }]}
                      value={config.secondary_layer.content_type} onChange={(v) => updateConfig('secondary_layer.content_type', v)} />
                    {config.secondary_layer.content_type === 'text' ? (
                      <input value={config.secondary_layer.text || ''} onChange={(e) => updateConfig('secondary_layer.text', e.target.value)} placeholder="Secondary text..."
                        style={{ width: '100%', padding: '6px 8px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 11, fontFamily: 'var(--font-mono)', outline: 'none' }} />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(config.secondary_layer.links || []).map((link, i) => (
                          <div key={i} style={{ display: 'flex', gap: 4 }}>
                            <input value={link.label || ''} onChange={(e) => { const nl = [...(config.secondary_layer.links || [])]; nl[i] = { ...nl[i], label: e.target.value }; updateConfig('secondary_layer.links', nl) }} placeholder="Label"
                              style={{ flex: 1, padding: '5px 8px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 10, fontFamily: 'var(--font-mono)', outline: 'none' }} />
                            <input value={link.url || ''} onChange={(e) => { const nl = [...(config.secondary_layer.links || [])]; nl[i] = { ...nl[i], url: e.target.value }; updateConfig('secondary_layer.links', nl) }} placeholder="URL"
                              style={{ flex: 1, padding: '5px 8px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 10, fontFamily: 'var(--font-mono)', outline: 'none' }} />
                            <button type="button" onClick={() => { const nl = (config.secondary_layer.links || []).filter((_, j) => j !== i); updateConfig('secondary_layer.links', nl) }}
                              style={{ padding: '5px 6px', background: 'none', border: 'none', color: 'var(--color-denied)', cursor: 'pointer', fontSize: 14 }}>×</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => updateConfig('secondary_layer.links', [...(config.secondary_layer.links || []), { label: '', url: '' }])}
                          style={{ padding: '5px 0', background: 'none', border: '1px dashed var(--color-line)', borderRadius: 6, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer', letterSpacing: '0.06em' }}>+ ADD LINK</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Collapsible>

            <Collapsible title="SEARCH">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>ENABLED</span>
                  <button type="button" onClick={() => updateConfig('search.enabled', !config.search.enabled)}
                    style={{ width: 36, height: 20, borderRadius: 10, border: 'none', backgroundColor: config.search.enabled ? 'var(--color-signal)' : 'var(--color-line)', cursor: 'pointer', position: 'relative', transition: 'background-color 0.15s' }}>
                    <span style={{ position: 'absolute', top: 2, left: config.search.enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.15s' }} />
                  </button>
                </div>
                {config.search.enabled && (
                  <input value={config.search.placeholder} onChange={(e) => updateConfig('search.placeholder', e.target.value)} placeholder="Search..."
                    style={{ width: '100%', padding: '6px 8px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 11, fontFamily: 'var(--font-mono)', outline: 'none' }} />
                )}
              </div>
            </Collapsible>

            <Collapsible title="BELOW-NAVBAR CAROUSEL">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>ENABLED</span>
                  <button type="button" onClick={() => updateConfig('below_navbar_carousel.enabled', !config.below_navbar_carousel.enabled)}
                    style={{ width: 36, height: 20, borderRadius: 10, border: 'none', backgroundColor: config.below_navbar_carousel.enabled ? 'var(--color-signal)' : 'var(--color-line)', cursor: 'pointer', position: 'relative', transition: 'background-color 0.15s' }}>
                    <span style={{ position: 'absolute', top: 2, left: config.below_navbar_carousel.enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.15s' }} />
                  </button>
                </div>
                {config.below_navbar_carousel.enabled && (
                  <>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>Autoplay (ms)</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text)' }}>{config.below_navbar_carousel.autoplay_ms}ms</span>
                      </div>
                      <input type="range" min="1000" max="10000" step="500" value={config.below_navbar_carousel.autoplay_ms} onChange={(e) => updateConfig('below_navbar_carousel.autoplay_ms', parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-signal)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(config.below_navbar_carousel.items || []).map((item, i) => (
                        <div key={i} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <ImageUploader value={item.image_url} onChange={(v) => { const ni = [...(config.below_navbar_carousel.items || [])]; ni[i] = { ...ni[i], image_url: v }; updateConfig('below_navbar_carousel.items', ni) }} />
                          <input value={item.caption || ''} onChange={(e) => { const ni = [...(config.below_navbar_carousel.items || [])]; ni[i] = { ...ni[i], caption: e.target.value }; updateConfig('below_navbar_carousel.items', ni) }} placeholder="Caption"
                            style={{ width: '100%', padding: '5px 8px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 10, fontFamily: 'var(--font-mono)', outline: 'none' }} />
                          <div style={{ display: 'flex', gap: 4 }}>
                            <input value={item.link || ''} onChange={(e) => { const ni = [...(config.below_navbar_carousel.items || [])]; ni[i] = { ...ni[i], link: e.target.value }; updateConfig('below_navbar_carousel.items', ni) }} placeholder="Link URL"
                              style={{ flex: 1, padding: '5px 8px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 10, fontFamily: 'var(--font-mono)', outline: 'none' }} />
                            <button type="button" onClick={() => { const ni = (config.below_navbar_carousel.items || []).filter((_, j) => j !== i); updateConfig('below_navbar_carousel.items', ni) }}
                              style={{ padding: '5px 8px', background: 'none', border: 'none', color: 'var(--color-denied)', cursor: 'pointer', fontSize: 14 }}>×</button>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => updateConfig('below_navbar_carousel.items', [...(config.below_navbar_carousel.items || []), { image_url: null, caption: '', link: '' }])}
                        style={{ padding: '6px 0', background: 'none', border: '1px dashed var(--color-line)', borderRadius: 6, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer', letterSpacing: '0.06em' }}>+ ADD ITEM</button>
                    </div>
                  </>
                )}
              </div>
            </Collapsible>

            <div style={{ display: 'flex', gap: 10, marginTop: 8, paddingTop: 12 }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--color-line)', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>CANCEL</button>
              <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', backgroundColor: 'var(--color-signal)', color: 'var(--color-void)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                {editing ? 'UPDATE' : 'CREATE'}
              </button>
            </div>
          </form>

          <div style={{ width: 300, padding: '16px 20px', overflowY: 'auto', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text-muted)', display: 'block', marginBottom: 12 }}>LIVE PREVIEW</span>
            <LivePreview config={config} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
