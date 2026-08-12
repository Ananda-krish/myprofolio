import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'
import IconPicker from './IconPicker'
import { ICONS } from './IconPicker'

const defaultStyle = {
  color: null,
  bold: false,
  fontSize: 'md',
  split_fill: { enabled: false, top_color: '#3ED9C4', bottom_color: '#8B5CF6', split_percent: 50 },
}

function SplitFillPreview({ topColor, bottomColor, splitPercent, label }) {
  return (
    <div style={{
      display: 'inline-flex', padding: '3px 10px', borderRadius: 4,
      background: `linear-gradient(to bottom, ${topColor} ${splitPercent}%, ${bottomColor} ${splitPercent}%)`,
      fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 600,
      letterSpacing: '0.06em', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.4)',
    }}>
      {label || 'Sample'}
    </div>
  )
}

export default function MenuForm({ menus, editing, onSubmit, onClose, portfolioId, channelPages }) {
  const [label, setLabel] = useState('')
  const [routePath, setRoutePath] = useState('')
  const [linkType, setLinkType] = useState('page')
  const [parentId, setParentId] = useState(null)
  const [icon, setIcon] = useState(null)
  const [isActive, setIsActive] = useState(true)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showParentDropdown, setShowParentDropdown] = useState(false)
  const [showPageDropdown, setShowPageDropdown] = useState(false)
  const [styleOpen, setStyleOpen] = useState(false)
  const [itemStyle, setItemStyle] = useState({ ...defaultStyle, split_fill: { ...defaultStyle.split_fill } })

  const isChannelScoped = !!portfolioId

  useEffect(() => {
    if (editing) {
      setLabel(editing.label || '')
      setRoutePath(editing.route_path || '')
      setLinkType(editing.link_type || 'page')
      setParentId(editing.parent_id)
      setIcon(editing.icon)
      setIsActive(editing.is_active)
      if (editing.style) {
        setItemStyle({
          color: editing.style.color ?? null,
          bold: editing.style.bold ?? false,
          fontSize: editing.style.fontSize ?? 'md',
          split_fill: {
            enabled: editing.style.split_fill?.enabled ?? false,
            top_color: editing.style.split_fill?.top_color ?? '#3ED9C4',
            bottom_color: editing.style.split_fill?.bottom_color ?? '#8B5CF6',
            split_percent: editing.style.split_fill?.split_percent ?? 50,
          },
        })
      }
    } else {
      setLabel('')
      setRoutePath('')
      setLinkType('page')
      setParentId(null)
      setIcon(null)
      setIsActive(true)
      setItemStyle({ ...defaultStyle, split_fill: { ...defaultStyle.split_fill } })
    }
  }, [editing])

  const flatOptions = buildFlatOptions(menus, 0, editing?.id)
  const parentLabel = flatOptions.find((o) => o.id === parentId)?.label || 'None / Root level'
  const SelectedIcon = icon ? ICONS[icon] : null
  const selectedPage = channelPages?.find((p) => p.slug === routePath)

  const updateStyle = (path, value) => {
    setItemStyle((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) { obj = obj[keys[i]] }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      label,
      route_path: routePath || null,
      link_type: linkType,
      parent_id: parentId,
      icon,
      is_active: isActive,
      portfolio_id: portfolioId || null,
      style: itemStyle,
    })
  }

  const hasCustomStyle = itemStyle.color || itemStyle.bold || itemStyle.fontSize !== 'md' || itemStyle.split_fill.enabled

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(14,16,19,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}
      >
        <style>{`
          .form-input { width: 100%; padding: 10px 12px; background: var(--color-void); border: 1px solid var(--color-line); border-radius: 8px; color: var(--color-text); font-size: 13px; font-family: var(--font-sans); outline: none; transition: border-color 0.12s; }
          .form-input:focus { border-color: var(--color-signal); }
          .form-label { font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 6px; display: block; }
        `}</style>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          style={{
            width: '100%', maxWidth: 440, backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--color-line)', borderRadius: 12, padding: 28,
            position: 'relative', maxHeight: '85vh', overflowY: 'auto',
          }}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
            <X size={16} />
          </button>

          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-signal)', marginBottom: 24 }}>
            {editing ? 'EDIT MENU ITEM' : 'NEW MENU ITEM'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="form-label">LABEL</label>
              <input className="form-input" value={label} onChange={(e) => setLabel(e.target.value)} required placeholder="Dashboard" />
            </div>

            {isChannelScoped && (
              <div>
                <label className="form-label">LINK TYPE</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" onClick={() => { setLinkType('page'); setRoutePath('') }}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: `1px solid ${linkType === 'page' ? 'var(--color-signal)' : 'var(--color-line)'}`, backgroundColor: linkType === 'page' ? 'rgba(62,217,196,0.12)' : 'transparent', color: linkType === 'page' ? 'var(--color-signal)' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>PAGE</button>
                  <button type="button" onClick={() => { setLinkType('external'); setRoutePath('') }}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: `1px solid ${linkType === 'external' ? 'var(--color-signal)' : 'var(--color-line)'}`, backgroundColor: linkType === 'external' ? 'rgba(62,217,196,0.12)' : 'transparent', color: linkType === 'external' ? 'var(--color-signal)' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>EXTERNAL URL</button>
                </div>
              </div>
            )}

            {isChannelScoped && linkType === 'page' ? (
              <div style={{ position: 'relative' }}>
                <label className="form-label">PAGE</label>
                <button type="button" onClick={() => setShowPageDropdown(!showPageDropdown)} className="form-input"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', color: routePath ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                  <span>{selectedPage?.title || 'Select a page...'}</span>
                  <ChevronDown size={14} />
                </button>
                {showPageDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 8, maxHeight: 180, overflowY: 'auto', zIndex: 10 }}>
                    {(channelPages || []).map((page) => (
                      <div key={page.id} onClick={() => { setRoutePath(page.slug); setShowPageDropdown(false) }}
                        style={{ padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-mono)', color: routePath === page.slug ? 'var(--color-signal)' : 'var(--color-text)', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.05)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                        {page.title}
                        <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--color-text-muted)', opacity: 0.5 }}>/{page.slug}</span>
                      </div>
                    ))}
                    {(!channelPages || channelPages.length === 0) && (
                      <div style={{ padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>No published pages yet</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="form-label">{isChannelScoped ? 'EXTERNAL URL' : 'ROUTE PATH'}</label>
                <input className="form-input" value={routePath} onChange={(e) => setRoutePath(e.target.value)} placeholder={isChannelScoped ? 'https://example.com' : '/dashboard'} />
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <label className="form-label">PARENT</label>
              <button type="button" onClick={() => setShowParentDropdown(!showParentDropdown)} className="form-input"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', color: parentId ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                <span>{parentLabel}</span>
                <ChevronDown size={14} />
              </button>
              {showParentDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 8, maxHeight: 180, overflowY: 'auto', zIndex: 10 }}>
                  <div onClick={() => { setParentId(null); setShowParentDropdown(false) }}
                    style={{ padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-mono)', color: parentId === null ? 'var(--color-signal)' : 'var(--color-text-muted)', cursor: 'pointer', borderBottom: '1px solid var(--color-line)' }}>
                    None / Root level
                  </div>
                  {flatOptions.map((opt) => (
                    <div key={opt.id} onClick={() => { setParentId(opt.id); setShowParentDropdown(false) }}
                      style={{ padding: '8px 12px', paddingLeft: 12 + opt.depth * 16, fontSize: 12, fontFamily: 'var(--font-mono)', color: parentId === opt.id ? 'var(--color-signal)' : 'var(--color-text)', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(62,217,196,0.05)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <label className="form-label">ICON</label>
              <button type="button" onClick={() => setShowIconPicker(!showIconPicker)} className="form-input"
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left' }}>
                {SelectedIcon ? (<><SelectedIcon size={16} style={{ color: 'var(--color-signal)' }} /><span>{icon}</span></>) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>Choose an icon</span>
                )}
              </button>
              {showIconPicker && <IconPicker value={icon} onSelect={setIcon} onClose={() => setShowIconPicker(false)} />}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label className="form-label" style={{ margin: 0 }}>ACTIVE</label>
              <button type="button" onClick={() => setIsActive(!isActive)}
                style={{ width: 36, height: 20, borderRadius: 10, border: 'none', backgroundColor: isActive ? 'var(--color-signal)' : 'var(--color-line)', cursor: 'pointer', position: 'relative', transition: 'background-color 0.15s' }}>
                <span style={{ position: 'absolute', top: 2, left: isActive ? 18 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.15s' }} />
              </button>
            </div>

            {/* STYLE SECTION */}
            <div style={{ borderBottom: '1px solid var(--color-line)' }}>
              <button type="button" onClick={() => setStyleOpen(!styleOpen)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text-muted)' }}>STYLE</span>
                  {hasCustomStyle && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-signal)' }} />}
                </div>
                <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', transition: 'transform 0.15s', transform: styleOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {styleOpen && (
                <div style={{ paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Color */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', minWidth: 80 }}>Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                      <input type="color" value={itemStyle.color || '#d1d5db'} onChange={(e) => updateStyle('color', e.target.value)}
                        style={{ width: 28, height: 28, border: '1px solid var(--color-line)', borderRadius: 6, cursor: 'pointer', backgroundColor: 'transparent', padding: 0 }} />
                      <input type="text" value={itemStyle.color || ''} onChange={(e) => updateStyle('color', e.target.value || null)} placeholder="default"
                        style={{ flex: 1, padding: '5px 8px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 11, fontFamily: 'var(--font-mono)', outline: 'none' }} />
                    </div>
                  </div>

                  {/* Bold */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', minWidth: 80 }}>Bold</label>
                    <button type="button" onClick={() => updateStyle('bold', !itemStyle.bold)}
                      style={{ width: 36, height: 20, borderRadius: 10, border: 'none', backgroundColor: itemStyle.bold ? 'var(--color-signal)' : 'var(--color-line)', cursor: 'pointer', position: 'relative', transition: 'background-color 0.15s' }}>
                      <span style={{ position: 'absolute', top: 2, left: itemStyle.bold ? 18 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.15s' }} />
                    </button>
                  </div>

                  {/* Font Size */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', minWidth: 80 }}>Size</label>
                    <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                      {[{ value: 'xs', label: 'XS' }, { value: 'sm', label: 'SM' }, { value: 'md', label: 'MD' }, { value: 'lg', label: 'LG' }].map((opt) => (
                        <button key={opt.value} type="button" onClick={() => updateStyle('fontSize', opt.value)}
                          style={{ flex: 1, padding: '5px 0', borderRadius: 4, border: `1px solid ${itemStyle.fontSize === opt.value ? 'var(--color-signal)' : 'var(--color-line)'}`, backgroundColor: itemStyle.fontSize === opt.value ? 'rgba(62,217,196,0.12)' : 'transparent', color: itemStyle.fontSize === opt.value ? 'var(--color-signal)' : 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer' }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Split Fill */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: itemStyle.split_fill.enabled ? 12 : 0 }}>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', minWidth: 80 }}>Split Fill</label>
                      <button type="button" onClick={() => updateStyle('split_fill.enabled', !itemStyle.split_fill.enabled)}
                        style={{ width: 36, height: 20, borderRadius: 10, border: 'none', backgroundColor: itemStyle.split_fill.enabled ? 'var(--color-signal)' : 'var(--color-line)', cursor: 'pointer', position: 'relative', transition: 'background-color 0.15s' }}>
                        <span style={{ position: 'absolute', top: 2, left: itemStyle.split_fill.enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.15s' }} />
                      </button>
                    </div>
                    {itemStyle.split_fill.enabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 88 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="color" value={itemStyle.split_fill.top_color} onChange={(e) => updateStyle('split_fill.top_color', e.target.value)}
                            style={{ width: 24, height: 24, border: '1px solid var(--color-line)', borderRadius: 4, cursor: 'pointer', backgroundColor: 'transparent', padding: 0 }} />
                          <input type="color" value={itemStyle.split_fill.bottom_color} onChange={(e) => updateStyle('split_fill.bottom_color', e.target.value)}
                            style={{ width: 24, height: 24, border: '1px solid var(--color-line)', borderRadius: 4, cursor: 'pointer', backgroundColor: 'transparent', padding: 0 }} />
                          <SplitFillPreview topColor={itemStyle.split_fill.top_color} bottomColor={itemStyle.split_fill.bottom_color} splitPercent={itemStyle.split_fill.split_percent} label={label || 'Link'} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)' }}>Split</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text)' }}>{itemStyle.split_fill.split_percent}% / {100 - itemStyle.split_fill.split_percent}%</span>
                          </div>
                          <input type="range" min="0" max="100" value={itemStyle.split_fill.split_percent} onChange={(e) => updateStyle('split_fill.split_percent', parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-signal)' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--color-line)', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>CANCEL</button>
              <button type="submit" style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', backgroundColor: 'var(--color-signal)', color: 'var(--color-void)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>{editing ? 'UPDATE' : 'CREATE'}</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function buildFlatOptions(nodes, depth, excludeId) {
  const result = []
  for (const node of nodes) {
    if (node.id !== excludeId) result.push({ id: node.id, label: node.label, depth })
    if (node.children && node.children.length > 0) result.push(...buildFlatOptions(node.children, depth + 1, excludeId))
  }
  return result
}
