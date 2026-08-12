import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

export default function KineticText({ text, color = '#3ED9C4', fontSize, fontWeight = 400, className = '', triggerRef }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !triggerRef?.current || !text) return

    const chars = containerRef.current.querySelectorAll('.kt-char')
    if (!chars.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(chars,
        { opacity: 0, y: 6 },
        {
          opacity: 1, y: 0,
          duration: 0.15,
          stagger: 0.015,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: triggerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [text, triggerRef])

  const letters = text.split('')

  return (
    <span ref={containerRef} className={className} aria-label={text} style={{ display: 'inline' }}>
      {letters.map((char, i) => (
        <span
          key={`${i}`}
          className="kt-char"
          style={{
            color,
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : undefined,
            fontSize: fontSize || undefined,
            fontWeight,
            opacity: 0,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}
