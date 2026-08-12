import { motion } from 'framer-motion'

export default function KineticText({ text, color = 'var(--color-signal)', className = '' }) {
  const letters = text.split('')

  return (
    <span className={className} aria-label={text}>
      {letters.map((char, i) => (
        <motion.span
          key={`${text}-${i}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, delay: i * 0.015, ease: 'easeOut' }}
          style={{ color, display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}
