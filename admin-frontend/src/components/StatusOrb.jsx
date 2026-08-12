import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Orb({ state = 'idle' }) {
  const meshRef = useRef()
  const colorRef = useRef(new THREE.Color('#3ED9C4'))

  const targetColor = useMemo(() => {
    const map = {
      idle: '#3ED9C4',
      trying: '#3ED9C4',
      success: '#7FD858',
      error: '#E85454',
    }
    return new THREE.Color(map[state] || map.idle)
  }, [state])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    const mesh = meshRef.current

    colorRef.current.lerp(targetColor, delta * 4)
    mesh.material.color.copy(colorRef.current)

    if (state === 'idle') {
      mesh.rotation.y += 0.003
      mesh.rotation.x += 0.001
    } else if (state === 'trying') {
      mesh.rotation.y += 0.012
      mesh.rotation.x += 0.006
      const pulse = Math.sin(Date.now() * 0.005) * 0.05
      mesh.scale.setScalar(1 + pulse)
    } else if (state === 'success') {
      mesh.rotation.y += 0.003
      const t = Math.min(1, mesh.userData.successTime || 0)
      const bounce = 1 + 0.3 * Math.sin(t * Math.PI) * (1 - t)
      mesh.scale.setScalar(bounce)
      mesh.userData.successTime = (mesh.userData.successTime || 0) + delta * 2
    } else if (state === 'error') {
      mesh.rotation.y += (Math.random() - 0.5) * 0.15
      mesh.rotation.x += (Math.random() - 0.5) * 0.1
      mesh.scale.setScalar(1)
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial color="#3ED9C4" wireframe />
    </mesh>
  )
}

export default function StatusOrb({ state = 'idle' }) {
  return (
    <div style={{ width: 160, height: 160, overflow: 'visible' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        gl={{ alpha: true, antialias: false }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent', overflow: 'visible' }}
      >
        <Orb state={state} />
      </Canvas>
    </div>
  )
}
