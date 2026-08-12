import { motion } from 'framer-motion'
import { LayoutTemplate, Type, Images } from 'lucide-react'

const TYPES = [
  {
    type: 'hero',
    label: 'HERO',
    description: 'Full-width banner with heading, subheading, and optional CTA button',
    icon: LayoutTemplate,
    color: 'var(--color-signal)',
  },
  {
    type: 'text',
    label: 'TEXT',
    description: 'Rich text block for paragraphs, descriptions, and written content',
    icon: Type,
    color: '#8B5CF6',
  },
  {
    type: 'gallery',
    label: 'GALLERY',
    description: 'Image grid with optional captions for portfolios and showcases',
    icon: Images,
    color: '#F59E0B',
  },
]

export default function SectionTypePicker({ onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(14,16,19,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520,
          backgroundColor: 'var(--color-panel)',
          border: '1px solid var(--color-line)',
          borderRadius: 12, padding: 28,
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-signal)', marginBottom: 20 }}>
          ADD SECTION
        </h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 20, letterSpacing: '0.08em' }}>
          SELECT TYPE
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {TYPES.map(({ type, label, description, icon: Icon, color }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                padding: '24px 16px', borderRadius: 10,
                border: `1px solid var(--color-line)`,
                backgroundColor: 'transparent',
                cursor: 'pointer', transition: 'all 0.12s',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.backgroundColor = `${color}10` }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-line)'; e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                backgroundColor: `${color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text)', marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  {description}
                </div>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: 16, padding: '10px 0', borderRadius: 8,
            border: '1px solid var(--color-line)', backgroundColor: 'transparent',
            color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11,
            fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer',
          }}
        >
          CANCEL
        </button>
      </motion.div>
    </motion.div>
  )
}
