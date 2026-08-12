import { Suspense, useRef, useEffect, useState, useMemo, lazy } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function useReducedMotion() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
}

function Model({ glbUrl, rotationSpeed = 0.2, hoverScale = 1.15, hoverColor = null }) {
  const { scene } = useGLTF(glbUrl, true)
  const groupRef = useRef()
  const { gl } = useThree()
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (!groupRef.current || reduced) return
    groupRef.current.rotation.y += rotationSpeed * delta
  })

  useEffect(() => {
    if (!groupRef.current || reduced || !hoverColor) return
    const mat = groupRef.current.children?.[0]?.material
    if (!mat || !mat.color) return

    const target = hovered ? hoverColor : '#ffffff'
    gsap.to(mat.color, {
      r: parseInt(target.slice(1, 3), 16) / 255,
      g: parseInt(target.slice(3, 5), 16) / 255,
      b: parseInt(target.slice(5, 7), 16) / 255,
      duration: 0.25,
      ease: 'power2.out',
    })
  }, [hovered, hoverColor, reduced])

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={1}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); gl.domElement.style.cursor = 'pointer' }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); gl.domElement.style.cursor = 'auto' }}
      />
    </group>
  )
}

function WaypointController({ glbUrl, rotationSpeed, hoverScale, hoverColor, sections }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  const enabledSections = useMemo(() => {
    return sections.filter(s => s.content?.model_waypoint?.enabled)
  }, [sections])

  useEffect(() => {
    if (!canvasRef.current || !enabledSections.length) return

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(canvasRef.current, { opacity: 1 })
        return
      }

      gsap.set(canvasRef.current, { opacity: 0 })

      const first = enabledSections[0]?.id
      const last = enabledSections[enabledSections.length - 1]?.id

      const firstEl = document.getElementById(`section-${first}`)
      const lastEl = document.getElementById(`section-${last}`)

      if (firstEl) {
        gsap.to(canvasRef.current, {
          opacity: 1,
          duration: 0.4,
          scrollTrigger: {
            trigger: firstEl,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      if (lastEl) {
        gsap.to(canvasRef.current, {
          opacity: 0,
          scrollTrigger: {
            trigger: lastEl,
            start: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [enabledSections, reduced])

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none',
      opacity: reduced ? 1 : 0,
    }}>
      <div ref={canvasRef} style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          style={{ background: 'transparent', pointerEvents: 'auto' }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 2]} intensity={0.8} />
          <Suspense fallback={null}>
            <Model
              glbUrl={glbUrl}
              rotationSpeed={rotationSpeed}
              hoverScale={hoverScale}
              hoverColor={hoverColor}
            />
            <Environment preset="studio" />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default function PageModelCanvas({ modelConfig, sections }) {
  if (!modelConfig?.glb_url) return null

  const rotationSpeed = modelConfig.idle?.rotation_speed ?? 0.2
  const hoverScale = modelConfig.hover?.scale ?? 1.15
  const hoverColor = modelConfig.hover?.color ?? null

  return (
    <WaypointController
      glbUrl={modelConfig.glb_url}
      rotationSpeed={rotationSpeed}
      hoverScale={hoverScale}
      hoverColor={hoverColor}
      sections={sections}
    />
  )
}
