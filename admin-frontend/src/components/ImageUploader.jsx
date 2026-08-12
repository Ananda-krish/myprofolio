import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Link as LinkIcon } from 'lucide-react'
import api from '../api/apiConfig'

export default function ImageUploader({ value, onChange }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState('')

  const uploadFile = useCallback(async (file) => {
    if (!file) return
    setError('')
    setUploading(true)
    setProgress(0)
    setUrlMode(false)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await api.post('/api/v1/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total))
        },
      })
      onChange(data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) uploadFile(file)
  }

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false) }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlMode(false)
      setUrlInput('')
    }
  }

  const handleRemove = () => {
    onChange(null)
    setUrlMode(false)
  }

  const accentColor = 'var(--color-signal)'

  if (value) {
    return (
      <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-line)' }}>
        <img
          src={value}
          alt="Uploaded"
          style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 60%, rgba(0,0,0,0.6))' }} />
        <button
          onClick={handleRemove}
          title="Remove image"
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 24, height: 24, borderRadius: 6,
            border: 'none', backgroundColor: 'rgba(0,0,0,0.6)',
            color: '#fff', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <X size={12} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Replace with a different image"
          style={{
            position: 'absolute', bottom: 8, right: 8,
            padding: '4px 8px', borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-mono)',
            fontSize: 9, fontWeight: 600, letterSpacing: '0.08em',
            backdropFilter: 'blur(4px)',
          }}
        >
          REPLACE
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    )
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          position: 'relative',
          height: 120,
          borderRadius: 8,
          border: `2px dashed ${dragActive ? accentColor : 'var(--color-line)'}`,
          backgroundColor: dragActive ? 'rgba(62,217,196,0.04)' : 'transparent',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 8, cursor: uploading ? 'default' : 'pointer',
          transition: 'all 0.15s',
          overflow: 'hidden',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <>
            <div style={{
              width: 60, height: 4, borderRadius: 2,
              backgroundColor: 'var(--color-line)', overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                style={{ height: '100%', backgroundColor: accentColor, borderRadius: 2 }}
              />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>
              {progress}%
            </span>
          </>
        ) : (
          <>
            <Upload size={18} style={{ color: dragActive ? accentColor : 'var(--color-text-muted)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
              {dragActive ? 'DROP IMAGE' : 'DRAG & DROP OR CLICK'}
            </span>
          </>
        )}
      </div>

      {error && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-denied)', marginTop: 4, display: 'block' }}>
          {error}
        </span>
      )}

      {!urlMode && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setUrlMode(true) }}
          style={{
            marginTop: 8, display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)',
            letterSpacing: '0.06em',
          }}
        >
          <LinkIcon size={10} />
          OR PASTE IMAGE URL
        </button>
      )}

      {urlMode && (
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            placeholder="https://example.com/image.jpg"
            style={{
              flex: 1, padding: '8px 10px', backgroundColor: 'var(--color-void)',
              border: '1px solid var(--color-line)', borderRadius: 6,
              color: 'var(--color-text)', fontSize: 12, fontFamily: 'var(--font-sans)',
              outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = accentColor }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-line)' }}
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            style={{
              padding: '6px 12px', borderRadius: 6, border: 'none',
              backgroundColor: accentColor, color: 'var(--color-void)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.06em', cursor: 'pointer',
            }}
          >
            SET
          </button>
          <button
            type="button"
            onClick={() => { setUrlMode(false); setUrlInput('') }}
            style={{
              padding: '6px 10px', borderRadius: 6,
              border: '1px solid var(--color-line)', backgroundColor: 'transparent',
              color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)',
              fontSize: 10, cursor: 'pointer',
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
