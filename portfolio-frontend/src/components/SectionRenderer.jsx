import { useRef, useEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import KineticText from './KineticText'

const fsMap = { xs: '10px', sm: '13px', md: '16px', lg: '22px', xl: '30px', '2xl': '40px' }
const padMap = { sm: '16px', md: '28px', lg: '40px', xl: '56px' }
const gapMap = { sm: '6px', md: '12px', lg: '20px' }
const maxWMap = { narrow: '400px', medium: '600px', wide: '800px', full: '100%' }
const heightVh = { full: '100vh', large: '85vh', medium: '65vh', auto: 'auto' }

const anchorStyles = (pad) => ({
  'top-left': { top: pad, left: pad, alignItems: 'flex-start', textAlign: 'left' },
  'top-center': { top: pad, left: '50%', transform: 'translateX(-50%)', alignItems: 'center', textAlign: 'center' },
  'top-right': { top: pad, right: pad, alignItems: 'flex-end', textAlign: 'right' },
  'center-left': { top: '50%', left: pad, transform: 'translateY(-50%)', alignItems: 'flex-start', textAlign: 'left' },
  'center': { top: '50%', left: '50%', transform: 'translate(-50%,-50%)', alignItems: 'center', textAlign: 'center' },
  'center-right': { top: '50%', right: pad, transform: 'translateY(-50%)', alignItems: 'flex-end', textAlign: 'right' },
  'bottom-left': { bottom: pad, left: pad, alignItems: 'flex-start', textAlign: 'left' },
  'bottom-center': { bottom: pad, left: '50%', transform: 'translateX(-50%)', alignItems: 'center', textAlign: 'center' },
  'bottom-right': { bottom: pad, right: pad, alignItems: 'flex-end', textAlign: 'right' },
})

const focalMap = { top: 'top center', center: 'center center', bottom: 'bottom center' }

function useReducedMotion() {
  const mq = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
  return mq
}

/* ---------- HERO ---------- */
function HeroSection({ content }) {
  const h = content.heading || {}
  const sub = content.subheading || {}
  const paras = (content.paragraphs || []).filter(p => p.visible && p.text)
  const bg = content.background || {}
  const lay = content.layout || {}
  const sp = content.spacing || {}
  const cta = content.cta || {}
  const reduced = useReducedMotion()

  const pad = padMap[sp.padding] || '28px'
  const anchors = anchorStyles(pad)
  const aStyle = anchors[lay.anchor] || anchors.center
  const canPin = !reduced && lay.height && lay.height !== 'auto'

  const containerRef = useRef(null)
  const bgRef = useRef(null)
  const headingRef = useRef(null)
  const subRef = useRef(null)
  const paraRefs = useRef([])
  const ctaRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const bg = bgRef.current
    const contentEl = contentRef.current
    if (!container || !contentEl) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=60%',
          pin: canPin,
          scrub: !canPin,
          ...(canPin ? {} : { toggleActions: 'play none none none' }),
        },
      })

      if (!reduced && bg) {
        tl.to(bg, {
          yPercent: -40,
          ease: 'none',
          duration: 1,
        }, 0)
      }

      const headingEl = headingRef.current
      if (headingEl) {
        const chars = headingEl.querySelectorAll('.kt-char')
        if (chars.length) {
          tl.fromTo(chars,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.3, stagger: 0.015, ease: 'power2.out' },
            0
          )
        }
      }

      const elements = []
      if (subRef.current) elements.push(subRef.current)
      paraRefs.current.forEach(el => { if (el) elements.push(el) })

      if (elements.length) {
        tl.fromTo(elements,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.2, stagger: 0.06, ease: 'power2.out' },
          0.35
        )
      }

      if (ctaRef.current) {
        tl.fromTo(ctaRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' },
          0.6
        )
      }
    }, container)

    return () => ctx.revert()
  }, [reduced, canPin])

  return (
    <div ref={containerRef} style={{
      width: '100%', minHeight: heightVh[lay.height] || '85vh', borderRadius: 0, overflow: 'hidden',
      position: 'relative', backgroundColor: bg.fallback_color || '#111827',
    }}>
      {bg.image && (
        <img ref={bgRef} src={bg.image} alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '120%',
            objectFit: 'cover', objectPosition: focalMap[bg.focal_point] || 'center center',
            willChange: 'transform',
          }} />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: bg.fallback_color || '#111827',
        opacity: bg.image ? (bg.overlay_opacity ?? 40) / 100 : 1,
      }} />
      <div ref={contentRef} style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        gap: gapMap[sp.element_gap] || '12px',
        padding: pad,
        maxWidth: maxWMap[lay.max_width] || '600px',
        ...(lay.anchor?.includes('top') ? { justifyContent: 'flex-start' } :
          lay.anchor?.includes('bottom') ? { justifyContent: 'flex-end' } : { justifyContent: 'center' }),
        ...aStyle,
      }}>
        {h.visible !== false && h.text && (
          <div ref={headingRef} style={{ lineHeight: 1.2 }}>
            <KineticText
              text={h.text}
              color={h.color || '#ffffff'}
              fontSize={fsMap[h.fontSize] || '40px'}
              fontWeight={h.weight || 700}
            />
          </div>
        )}
        {sub.visible !== false && sub.text && (
          <div ref={subRef} style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: fsMap[sub.fontSize] || '16px',
            fontWeight: sub.weight || 400,
            color: sub.color || 'rgba(255,255,255,0.75)',
            lineHeight: 1.4,
          }}>
            {sub.text}
          </div>
        )}
        {paras.map((p, i) => (
          <div key={i} ref={el => paraRefs.current[i] = el} style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: fsMap[p.fontSize] || '16px',
            fontWeight: p.weight || 400,
            color: p.color || 'rgba(255,255,255,0.6)',
            lineHeight: 1.4,
          }}>
            {p.text}
          </div>
        ))}
        {cta.text && (
          <div ref={ctaRef} style={{
            marginTop: 4,
            display: 'flex',
            justifyContent: lay.text_align === 'left' ? 'flex-start' : lay.text_align === 'right' ? 'flex-end' : 'center',
          }}>
            <div style={{
              padding: '8px 20px', borderRadius: 6,
              fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              textDecoration: 'none', display: 'inline-block',
              ...(cta.variant === 'solid' ? { backgroundColor: cta.color || '#3ED9C4', color: '#fff' } :
                cta.variant === 'outline' ? { border: `1px solid ${cta.color || '#3ED9C4'}`, color: cta.color || '#3ED9C4', backgroundColor: 'transparent' } :
                { color: cta.color || '#3ED9C4', backgroundColor: 'transparent' }),
            }}>
              {cta.text}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- TEXT ---------- */
function TextSection({ content }) {
  const h = content.heading || {}
  const sub = content.subheading || {}
  const paras = (content.paragraphs || []).filter(p => p.visible && p.text)
  const lay = content.layout || {}
  const sp = content.spacing || {}
  const reduced = useReducedMotion()

  const pad = padMap[sp.padding] || '28px'
  const anchors = anchorStyles(pad)
  const aStyle = anchors[lay.anchor] || anchors.center

  const containerRef = useRef(null)
  const headingRef = useRef(null)
  const subRef = useRef(null)
  const paraRefs = useRef([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      const headingEl = headingRef.current
      if (headingEl) {
        const chars = headingEl.querySelectorAll('.kt-char')
        if (chars.length) {
          gsap.fromTo(chars,
            { opacity: 0, y: 6 },
            {
              opacity: 1, y: 0,
              duration: 0.15, stagger: 0.015, ease: 'power2.out',
              scrollTrigger: { trigger: container, start: 'top 80%', toggleActions: 'play none none none' },
            }
          )
        }
      }

      const textEls = []
      if (subRef.current) textEls.push(subRef.current)
      paraRefs.current.forEach(el => { if (el) textEls.push(el) })

      if (textEls.length) {
        if (reduced) {
          gsap.fromTo(textEls,
            { opacity: 0 },
            {
              opacity: 1, duration: 0.3, stagger: 0.08,
              scrollTrigger: { trigger: container, start: 'top 75%', toggleActions: 'play none none none' },
            }
          )
        } else {
          textEls.forEach((el) => {
            gsap.fromTo(el,
              { opacity: 0, y: 16, filter: 'blur(6px)' },
              {
                opacity: 1, y: 0, filter: 'blur(0px)',
                ease: 'none',
                willChange: 'transform, opacity, filter',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 85%',
                  end: 'top 40%',
                  scrub: true,
                },
              }
            )
          })
        }
      }
    }, container)

    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={containerRef} style={{
      width: '100%', minHeight: heightVh[lay.height] || '85vh', borderRadius: 0, overflow: 'hidden',
      position: 'relative', backgroundColor: '#111827',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        gap: gapMap[sp.element_gap] || '12px',
        padding: pad,
        maxWidth: maxWMap[lay.max_width] || '600px',
        ...(lay.anchor?.includes('top') ? { justifyContent: 'flex-start' } :
          lay.anchor?.includes('bottom') ? { justifyContent: 'flex-end' } : { justifyContent: 'center' }),
        ...aStyle,
      }}>
        {h.visible !== false && h.text && (
          <div ref={headingRef} style={{ lineHeight: 1.2 }}>
            <KineticText
              text={h.text}
              color={h.color || '#ffffff'}
              fontSize={fsMap[h.fontSize] || '30px'}
              fontWeight={h.weight || 700}
            />
          </div>
        )}
        {sub.visible !== false && sub.text && (
          <div ref={subRef} style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: fsMap[sub.fontSize] || '16px',
            fontWeight: sub.weight || 400,
            color: sub.color || 'rgba(255,255,255,0.75)',
            lineHeight: 1.4,
          }}>
            {sub.text}
          </div>
        )}
        {paras.map((p, i) => (
          <div key={i} ref={el => paraRefs.current[i] = el} style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: fsMap[p.fontSize] || '16px',
            fontWeight: p.weight || 400,
            color: p.color || 'rgba(255,255,255,0.6)',
            lineHeight: 1.4,
          }}>
            {p.text}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- GALLERY ---------- */
function GallerySection({ content }) {
  const imgs = (content.images || []).filter(i => i.url)
  const grid = content.grid || {}
  const lay = content.layout || {}
  const sp = content.spacing || {}
  const reduced = useReducedMotion()
  const cols = grid.columns || 3
  const gap = gapMap[sp.element_gap] || '12px'

  const arMap = { square: '1/1', landscape: '16/9', original: 'auto' }
  const ar = arMap[grid.aspect_ratio] || '1/1'

  const containerRef = useRef(null)
  const imgRefs = useRef([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const ctx = gsap.context(() => {
      const items = imgRefs.current.filter(Boolean)
      if (!items.length) return

      if (reduced) {
        gsap.fromTo(items,
          { opacity: 0 },
          {
            opacity: 1, duration: 0.3, stagger: 0.08,
            scrollTrigger: { trigger: container, start: 'top 80%', toggleActions: 'play none none none' },
          }
        )
      } else {
        gsap.fromTo(items,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1, scale: 1,
            duration: 0.3, stagger: 0.08, ease: 'power2.out',
            scrollTrigger: { trigger: container, start: 'top 80%', toggleActions: 'play none none none' },
          }
        )
      }
    }, container)

    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={containerRef} style={{
      width: '100%', minHeight: heightVh[lay.height] || '85vh', borderRadius: 0, overflow: 'hidden',
      position: 'relative', backgroundColor: '#111827',
      padding: padMap[sp.padding] || '28px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
        maxWidth: maxWMap[lay.max_width] || '100%',
        margin: '0 auto',
      }}>
        {imgs.map((img, i) => (
          <div key={i} ref={el => imgRefs.current[i] = el} style={{
            borderRadius: 6, overflow: 'hidden',
            aspectRatio: ar,
            backgroundColor: 'rgba(255,255,255,0.05)',
            transition: 'transform 200ms ease',
            cursor: 'default',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <img src={img.url} alt={img.caption || ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- EXPORT ---------- */
export default function SectionRenderer({ section, pulse }) {
  const c = section.content
  if (!c) return null

  const pulseStyle = pulse ? {
    animation: 'reverbPulse 1.2s ease-out',
  } : null

  switch (section.type) {
    case 'hero': return <div style={pulseStyle}><HeroSection content={c} /></div>
    case 'text': return <div style={pulseStyle}><TextSection content={c} /></div>
    case 'gallery': return <div style={pulseStyle}><GallerySection content={c} /></div>
    default: return null
  }
}
