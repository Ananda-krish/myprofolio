import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Box, Upload, Trash2, RotateCw, MousePointer2, X } from 'lucide-react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
import { useUploadModel, useUpdateModelConfig, useDeleteModel } from '../api/modelHooks'

function GLTFPreview({ url }) {
  const { scene } = useGLTF(url)
  const ref = useRef()
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.01 })
  return <primitive ref={ref} object={scene} scale={1} />
}

function ModelPreview({ url, rotationSpeed = 0.2 }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div style={{ width: 200, height: 200, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-line)', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 1]} intensity={1} />
        <Suspense fallback={null}>
          <GLTFPreview url={url} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>Loading preview...</span>
        </div>
      )}
    </div>
  )
}

export default function ModelPanel({ channelId, pageId, modelConfig }) {
  const [dragOver, setDragOver] = useState(false)
  const [warning, setWarning] = useState(false)
  const fileRef = useRef(null)
  const config = modelConfig || { glb_url: null, idle: { rotation_speed: 0.2 }, hover: { scale: 1.15, color: null } }

  const uploadMutation = useUploadModel(channelId, pageId)
  const configMutation = useUpdateModelConfig(channelId, pageId)
  const deleteMutation = useDeleteModel(channelId, pageId)

  const [rotationSpeed, setRotationSpeed] = useState(config.idle?.rotation_speed ?? 0.2)
  const [hoverScale, setHoverScale] = useState(config.hover?.scale ?? 1.15)
  const [hoverColor, setHoverColor] = useState(config.hover?.color ?? '')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  useEffect(() => {
    setRotationSpeed(config.idle?.rotation_speed ?? 0.2)
    setHoverScale(config.hover?.scale ?? 1.15)
    setHoverColor(config.hover?.color ?? '')
  }, [modelConfig])

  const commitConfig = useCallback((patch) => {
    configMutation.mutate(patch)
  }, [configMutation])

  const handleFile = useCallback((file) => {
    if (!file) return
    setWarning(false)
    if (file.size > 10 * 1024 * 1024) setWarning(true)
    uploadMutation.mutate(file)
  }, [uploadMutation])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith('.glb')) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true) }, [])
  const handleDragLeave = useCallback(() => setDragOver(false), [])

  const hasModel = !!config.glb_url

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      style={{ backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 12, padding: 28, marginBottom: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Box size={16} style={{ color: '#8B5CF6' }} />
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-text)' }}>
          3D MODEL
        </h2>
      </div>

      {!hasModel ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--color-signal)' : 'var(--color-line)'}`,
            borderRadius: 8, padding: 40, textAlign: 'center', cursor: 'pointer',
            backgroundColor: dragOver ? 'rgba(62,217,196,0.04)' : 'transparent',
            transition: 'all 0.15s',
          }}
        >
          <input ref={fileRef} type="file" accept=".glb" style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0])} />
          <Upload size={24} style={{ color: 'var(--color-text-muted)', marginBottom: 8 }} />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Drop .glb file or click to browse
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', opacity: 0.6 }}>
            Max 15 MB
          </p>
        </div>
      ) : (
        <div>
          {warning && (
            <div style={{
              padding: '8px 12px', borderRadius: 6, marginBottom: 16,
              backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: '#F59E0B',
            }}>
              Large file — consider compressing before upload for faster page loads.
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <ModelPreview url={config.glb_url} />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text)', marginBottom: 8, wordBreak: 'break-all' }}>
                {config.glb_url?.split('/').pop()}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => fileRef.current?.click()} style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-line)',
                  backgroundColor: 'transparent', color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  letterSpacing: '0.06em',
                }}>
                  REPLACE
                </button>
                <button onClick={() => setShowConfirmDelete(true)} style={{
                  padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-line)',
                  backgroundColor: 'transparent', color: 'var(--color-denied)',
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  letterSpacing: '0.06em',
                }}>
                  REMOVE
                </button>
              </div>
              <input ref={fileRef} type="file" accept=".glb" style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RotateCw size={12} style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>IDLE ROTATION</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text)' }}>{rotationSpeed.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="1" step="0.01" value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                onMouseUp={() => commitConfig({ idle: { rotation_speed: rotationSpeed } })}
                onTouchEnd={() => commitConfig({ idle: { rotation_speed: rotationSpeed } })}
                style={{ width: '100%', accentColor: 'var(--color-signal)' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MousePointer2 size={12} style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>HOVER SCALE</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text)' }}>{hoverScale.toFixed(2)}</span>
              </div>
              <input type="range" min="1" max="2" step="0.01" value={hoverScale}
                onChange={(e) => setHoverScale(parseFloat(e.target.value))}
                onMouseUp={() => commitConfig({ hover: { scale: hoverScale } })}
                onTouchEnd={() => commitConfig({ hover: { scale: hoverScale } })}
                style={{ width: '100%', accentColor: 'var(--color-signal)' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>HOVER COLOR</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {hoverColor && (
                    <button onClick={() => { setHoverColor(''); commitConfig({ hover: { color: null } }) }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <X size={12} />
                    </button>
                  )}
                  <input type="color" value={hoverColor || '#3ED9C4'}
                    onChange={(e) => setHoverColor(e.target.value)}
                    onMouseUp={() => commitConfig({ hover: { color: hoverColor || null } })}
                    onTouchEnd={() => commitConfig({ hover: { color: hoverColor || null } })}
                    style={{ width: 24, height: 24, border: '1px solid var(--color-line)', borderRadius: 4, cursor: 'pointer', padding: 0, backgroundColor: 'transparent' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(14,16,19,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', maxWidth: 380, backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 12, padding: 28, textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-denied)', marginBottom: 12 }}>REMOVE MODEL</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 24 }}>
              This will permanently delete the uploaded 3D model.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowConfirmDelete(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--color-line)', backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>CANCEL</button>
              <button onClick={() => { deleteMutation.mutate(); setShowConfirmDelete(false) }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', backgroundColor: 'var(--color-denied)', color: 'white', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>REMOVE</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
