import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const fsMap = { xs: '9px', sm: '10px', md: '11px', lg: '13px' }

function NavbarDropdown({ item, config, currentSlug, onNavigate, onHoverStyle, onLeaveStyle }) {
  const [open, setOpen] = useState(false)
  const colors = config.colors || {}
  const hoverEffect = config.hover_effect || 'underline'
  const s = item.style || {}
  const sf = s.split_fill || {}

  const handleHover = (e) => {
    if (hoverEffect === 'underline') { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '4px' }
    else if (hoverEffect === 'glow') { e.currentTarget.style.textShadow = `0 0 8px ${colors.text_hover || '#3ED9C4'}` }
    else if (hoverEffect === 'scale') { e.currentTarget.style.transform = 'scale(1.05)' }
    else if (hoverEffect === 'background-fill') { e.currentTarget.style.backgroundColor = `${colors.text_hover || '#3ED9C4'}15`; e.currentTarget.style.borderRadius = '4px'; e.currentTarget.style.padding = '4px 10px' }
  }

  const linkStyle = {}
  if (s.color) linkStyle.color = s.color
  if (s.bold) linkStyle.fontWeight = 700
  if (s.fontSize && fsMap[s.fontSize]) linkStyle.fontSize = fsMap[s.fontSize]
  if (sf.enabled) {
    linkStyle.background = `linear-gradient(to bottom, ${sf.top_color || '#3ED9C4'} ${sf.split_percent || 50}%, ${sf.bottom_color || '#8B5CF6'} ${sf.split_percent || 50}%)`
    linkStyle.backgroundClip = 'text'
    linkStyle.WebkitBackgroundClip = 'text'
    linkStyle.color = 'transparent'
  }

  const handleClick = (child) => {
    if (child.link_type === 'external') { window.open(child.route_path, '_blank') }
    else if (child.route_path) { onNavigate(child.route_path) }
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span style={{
        fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: colors.text || '#d1d5db', padding: '8px 12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
        transition: 'all 0.15s', ...linkStyle,
      }}
      onMouseEnter={handleHover} onMouseLeave={onLeaveStyle}
      >
        {item.label}
        <span style={{ fontSize: 8, opacity: 0.5 }}>&#9662;</span>
      </span>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, minWidth: 160,
          backgroundColor: config.background?.style === 'glass' ? 'rgba(10,10,12,0.92)' : '#111827',
          backdropFilter: config.background?.style === 'glass' ? 'blur(12px)' : 'none',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 6,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 100,
        }}>
          {item.children.map((child) => {
            const cs = child.style || {}
            const csf = cs.split_fill || {}
            const isActive = currentSlug === child.route_path
            const childLinkStyle = {}
            if (cs.color) childLinkStyle.color = cs.color
            if (cs.bold) childLinkStyle.fontWeight = 700
            if (cs.fontSize && fsMap[cs.fontSize]) childLinkStyle.fontSize = fsMap[cs.fontSize]
            if (csf.enabled) {
              childLinkStyle.background = `linear-gradient(to bottom, ${csf.top_color || '#3ED9C4'} ${csf.split_percent || 50}%, ${csf.bottom_color || '#8B5CF6'} ${csf.split_percent || 50}%)`
              childLinkStyle.backgroundClip = 'text'
              childLinkStyle.WebkitBackgroundClip = 'text'
              childLinkStyle.color = 'transparent'
            }
            return (
              <div key={child.id} onClick={() => handleClick(child)} style={{
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 11,
                color: isActive ? (colors.text_active || '#3ED9C4') : (child.is_active ? (colors.text || '#d1d5db') : '#52525b'),
                padding: '7px 12px', cursor: child.is_active ? 'pointer' : 'default',
                borderRadius: 6, whiteSpace: 'nowrap', transition: 'background-color 0.1s',
                ...childLinkStyle,
              }}
              onMouseEnter={(e) => { if (child.is_active) e.currentTarget.style.backgroundColor = `${colors.text_hover || '#3ED9C4'}12` }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {child.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Carousel({ config }) {
  const items = config.items || []
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const interval = config.autoplay_ms || 4000

  useEffect(() => {
    if (paused || items.length <= 1) return
    const id = setInterval(() => setCurrent((c) => (c + 1) % items.length), interval)
    return () => clearInterval(id)
  }, [paused, items.length, interval])

  if (items.length === 0) return null
  const item = items[current]

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 40, backgroundColor: '#0a0a0c', overflow: 'hidden', zIndex: 198, top: 'var(--carousel-top, 0px)' }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {item?.image_url && (
        <img src={item.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
      )}
      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 24px' }}>
        {items.length > 1 && (
          <button onClick={() => setCurrent((c) => (c - 1 + items.length) % items.length)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, padding: 4 }}>&#8249;</button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {items.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? 20 : 6, height: 6, borderRadius: 3,
              backgroundColor: i === current ? '#3ED9C4' : 'rgba(255,255,255,0.2)',
              cursor: 'pointer', transition: 'all 0.3s',
            }} />
          ))}
        </div>
        {items.length > 1 && (
          <button onClick={() => setCurrent((c) => (c + 1) % items.length)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, padding: 4 }}>&#8250;</button>
        )}
      </div>
    </div>
  )
}

export default function Navbar({ portfolioId, menus, config }) {
  const navigate = useNavigate()
  const { pageSlug } = useParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpandedId, setMobileExpandedId] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredZone, setHoveredZone] = useState(null)
  const searchRef = useRef(null)

  const cfg = config || {}
  const bg = cfg.background || {}
  const ht = cfg.height || {}
  const colors = cfg.colors || {}
  const logo = cfg.logo || {}
  const sec = cfg.secondary_layer || {}
  const search = cfg.search || {}
  const hoverEffect = cfg.hover_effect || 'underline'
  const isLeft = cfg.position === 'left'

  const leftH = ht.left_px || 64
  const centerH = ht.center_px || 64
  const rightH = ht.right_px || 64
  const bladeEnabled = ht.blade_enabled || false
  const bladeExpanded = ht.blade_expanded_px || 96

  const getZoneHeight = useCallback((zone) => {
    if (bladeEnabled && hoveredZone === zone) return bladeExpanded
    return zone === 'left' ? leftH : zone === 'center' ? centerH : rightH
  }, [bladeEnabled, hoveredZone, leftH, centerH, rightH, bladeExpanded])

  const navMaxHeight = Math.max(getZoneHeight('left'), getZoneHeight('center'), getZoneHeight('right'))
  const secHeight = sec.enabled ? 24 : 0
  const carouselHeight = cfg.below_navbar_carousel?.enabled && cfg.below_navbar_carousel.items?.length ? 40 : 0
  const totalHeight = navMaxHeight + secHeight + carouselHeight

  useEffect(() => {
    if (!cfg.colors?.background_scrolled) return
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { setScrolled(window.scrollY > 50); ticking = false })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [cfg.colors?.background_scrolled])

  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) { setSearchOpen(false); setSearchQuery('') } }
    if (searchOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [searchOpen])

  const handleNavigate = useCallback((path) => {
    navigate(`/preview/${portfolioId}${path}`)
    setMobileOpen(false)
  }, [navigate, portfolioId])

  const handleHover = useCallback((e) => {
    if (hoverEffect === 'underline') { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '4px' }
    else if (hoverEffect === 'glow') { e.currentTarget.style.textShadow = `0 0 8px ${colors.text_hover || '#3ED9C4'}` }
    else if (hoverEffect === 'scale') { e.currentTarget.style.transform = 'scale(1.05)' }
    else if (hoverEffect === 'background-fill') { e.currentTarget.style.backgroundColor = `${colors.text_hover || '#3ED9C4'}15`; e.currentTarget.style.borderRadius = '4px' }
  }, [hoverEffect, colors.text_hover])

  const handleLeave = useCallback((e) => {
    e.currentTarget.style.textDecoration = 'none'
    e.currentTarget.style.textShadow = 'none'
    e.currentTarget.style.transform = 'none'
    e.currentTarget.style.backgroundColor = 'transparent'
  }, [])

  const bgResolved = scrolled && colors.background_scrolled
    ? colors.background_scrolled
    : bg.style === 'transparent' ? 'transparent' : bg.color || '#0a0a0c'

  const bgOpacity = bg.style === 'glass' ? (bg.opacity || 60) / 100 : 1

  const makeLinkStyle = (item) => {
    const s = item?.style || {}
    const sf = s.split_fill || {}
    const out = {}
    if (s.color) out.color = s.color
    if (s.bold) out.fontWeight = 700
    if (s.fontSize && fsMap[s.fontSize]) out.fontSize = fsMap[s.fontSize]
    if (sf.enabled) {
      out.background = `linear-gradient(to bottom, ${sf.top_color || '#3ED9C4'} ${sf.split_percent || 50}%, ${sf.bottom_color || '#8B5CF6'} ${sf.split_percent || 50}%)`
      out.backgroundClip = 'text'
      out.WebkitBackgroundClip = 'text'
      out.color = 'transparent'
    }
    return out
  }

  const renderNavItems = () =>
    menus.map((item) => {
      const isActive = item.route_path && item.route_path === pageSlug
      const linkSt = makeLinkStyle(item)
      if (item.link_type === 'external') {
        return (
          <a key={item.id} href={item.route_path} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.text || '#d1d5db', textDecoration: 'none', padding: '8px 12px', whiteSpace: 'nowrap', transition: 'all 0.15s', ...linkSt }}
            onMouseEnter={handleHover} onMouseLeave={handleLeave}
          >{item.label}</a>
        )
      }
      if (item.children && item.children.length > 0) {
        return <NavbarDropdown key={item.id} item={item} config={cfg} currentSlug={pageSlug} onNavigate={handleNavigate} onHoverStyle={handleHover} onLeaveStyle={handleLeave} />
      }
      return (
        <span key={item.id} onClick={() => item.route_path && handleNavigate(item.route_path)}
          style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: isActive ? (colors.text_active || '#3ED9C4') : item.is_active ? (colors.text || '#d1d5db') : '#52525b', padding: '8px 12px', cursor: item.is_active ? 'pointer' : 'default', whiteSpace: 'nowrap', transition: 'all 0.15s', display: 'inline-block', ...linkSt }}
          onMouseEnter={handleHover} onMouseLeave={handleLeave}
        >{item.label}</span>
      )
    })

  const logoSize = logo.size || 36

  if (isLeft) {
    return (
      <>
        <nav style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: leftH,
          backgroundColor: bgResolved, opacity: bg.style === 'glass' ? bgOpacity : 1,
          backdropFilter: bg.style === 'glass' ? 'blur(12px)' : 'none',
          borderRight: bg.style !== 'transparent' ? '1px solid rgba(255,255,255,0.06)' : 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: `${Math.max(20, (leftH - 28) / 2)}px 0`, zIndex: 200,
        }}>
          <div onClick={() => handleNavigate('')} style={{ cursor: 'pointer', marginBottom: 24 }}>
            {logo.url ? (
              <img src={logo.url} alt="" style={{ width: logoSize, height: logoSize, objectFit: 'contain' }} />
            ) : (
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.text_active || '#3ED9C4', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>PROTFOLIO</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', alignItems: 'center' }}>
            {renderNavItems()}
          </div>
        </nav>
        <div style={{ marginLeft: leftH, minHeight: '100vh' }}>
          {sec.enabled && (
            <div style={{ height: 24, backgroundColor: sec.background_color || '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {sec.content_type === 'links' && sec.links ? (
                <div style={{ display: 'flex', gap: 16 }}>{sec.links.filter((l) => l.label).map((link, i) => (
                  <a key={i} href={link.url || '#'} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', textTransform: 'uppercase' }}>{link.label}</a>
                ))}</div>
              ) : <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>{sec.text || ''}</span>}
            </div>
          )}
        </div>
        <style>{`
          @media (max-width: 640px) { .navbar-mobile-toggle { display: flex !important; } .navbar-mobile-overlay { display: flex !important; } }
        `}</style>
      </>
    )
  }

  return (
    <>
      <nav
        onMouseEnter={() => bladeEnabled && setHoveredZone('all')}
        onMouseLeave={() => bladeEnabled && setHoveredZone(null)}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: navMaxHeight,
          backgroundColor: bgResolved, opacity: bg.style === 'glass' ? bgOpacity : 1,
          backdropFilter: bg.style === 'glass' ? 'blur(12px)' : 'none',
          borderBottom: bg.style !== 'transparent' ? '1px solid rgba(255,255,255,0.06)' : 'none',
          display: 'flex', alignItems: 'stretch',
          zIndex: 200, transition: bladeEnabled ? 'height 0.2s ease' : 'none',
        }}
      >
        {/* Left zone */}
        <div
          onMouseEnter={() => bladeEnabled && setHoveredZone('left')}
          onMouseLeave={() => bladeEnabled && setHoveredZone(null)}
          style={{ width: '30%', height: getZoneHeight('left'), display: 'flex', alignItems: 'center', padding: '0 16px', transition: 'height 0.2s ease', borderBottom: bg.style !== 'transparent' ? 'none' : '1px solid rgba(255,255,255,0.04)' }}
        >
          <div onClick={() => handleNavigate('')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {logo.url ? (
              <img src={logo.url} alt="" style={{ height: logoSize, width: logoSize, objectFit: 'contain', borderRadius: 4 }} />
            ) : (
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.text_active || '#3ED9C4' }}>PROTFOLIO</span>
            )}
          </div>
        </div>

        {/* Center zone */}
        <div
          onMouseEnter={() => bladeEnabled && setHoveredZone('center')}
          onMouseLeave={() => bladeEnabled && setHoveredZone(null)}
          style={{ width: '40%', height: getZoneHeight('center'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, transition: 'height 0.2s ease' }}
        >
          {renderNavItems()}
        </div>

        {/* Right zone */}
        <div
          onMouseEnter={() => bladeEnabled && setHoveredZone('right')}
          onMouseLeave={() => bladeEnabled && setHoveredZone(null)}
          style={{ width: '30%', height: getZoneHeight('right'), display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 16px', gap: 8, transition: 'height 0.2s ease' }}
        >
          {search.enabled && (
            <div ref={searchRef} style={{ position: 'relative' }}>
              {searchOpen ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={search.placeholder || 'Search...'}
                    onKeyDown={(e) => e.key === 'Escape' && (setSearchOpen(false), setSearchQuery(''))}
                    style={{ width: 160, padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: colors.text || '#d1d5db', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', outline: 'none' }} />
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', color: colors.text || '#d1d5db', cursor: 'pointer', padding: 6, display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                </button>
              )}
            </div>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="navbar-mobile-toggle"
            style={{ display: 'none', background: 'none', border: 'none', color: colors.text || '#d1d5db', cursor: 'pointer', padding: 6 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="navbar-mobile-overlay" style={{
          position: 'fixed', top: navMaxHeight, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10,10,12,0.95)', backdropFilter: 'blur(8px)',
          zIndex: 199, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {menus.map((item) => {
            const hasChildren = item.children && item.children.length > 0
            const expanded = mobileExpandedId === item.id
            const isActive = item.route_path && item.route_path === pageSlug
            const linkSt = makeLinkStyle(item)
            if (item.link_type === 'external') {
              return <a key={item.id} href={item.route_path} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.text || '#d1d5db', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', ...linkSt }}>{item.label}</a>
            }
            return (
              <div key={item.id}>
                <div onClick={() => { if (hasChildren) setMobileExpandedId(expanded ? null : item.id); else if (item.is_active && item.route_path) handleNavigate(item.route_path) }}
                  style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: isActive ? (colors.text_active || '#3ED9C4') : item.is_active ? (colors.text || '#d1d5db') : '#52525b', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: item.is_active ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...linkSt }}>
                  {item.label}
                  {hasChildren && <span style={{ fontSize: 10, opacity: 0.5, transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>&#9656;</span>}
                </div>
                {hasChildren && expanded && (
                  <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column' }}>
                    {item.children.map((child) => {
                      const childSt = makeLinkStyle(child)
                      return (
                        <span key={child.id} onClick={() => { if (child.link_type === 'external') window.open(child.route_path, '_blank'); else if (child.is_active && child.route_path) handleNavigate(child.route_path) }}
                          style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: child.is_active ? 'rgba(255,255,255,0.5)' : '#52525b', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: child.is_active ? 'pointer' : 'default', ...childSt }}>
                          {child.label}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!mobileOpen && sec.enabled && (
        <div style={{
          position: 'fixed', top: navMaxHeight, left: 0, right: 0, height: secHeight,
          backgroundColor: sec.background_color || '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 199, borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          {sec.content_type === 'links' && sec.links ? (
            <div style={{ display: 'flex', gap: 16 }}>{sec.links.filter((l) => l.label).map((link, i) => (
              <a key={i} href={link.url || '#'} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', textTransform: 'uppercase' }}>{link.label}</a>
            ))}</div>
          ) : <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>{sec.text || ''}</span>}
        </div>
      )}

      {!mobileOpen && cfg.below_navbar_carousel?.enabled && cfg.below_navbar_carousel.items?.length > 0 && (
        <div style={{ '--carousel-top': `${navMaxHeight + secHeight}px` }}>
          <Carousel config={cfg.below_navbar_carousel} />
        </div>
      )}

      <style>{`
        @media (max-width: 640px) { .navbar-mobile-toggle { display: flex !important; } .navbar-mobile-overlay { display: flex !important; } }
      `}</style>

      {!isLeft && <div style={{ height: totalHeight }} />}
    </>
  )
}
