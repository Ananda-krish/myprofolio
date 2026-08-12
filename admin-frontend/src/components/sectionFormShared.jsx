export const FONT_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
export const FONT_WEIGHTS = [300, 400, 500, 600, 700, 800]
export const ANCHORS = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]
export const HEIGHTS = ['full', 'large', 'medium', 'auto']
export const MAX_WIDTHS = ['narrow', 'medium', 'wide', 'full']
export const PADDINGS = ['sm', 'md', 'lg', 'xl']
export const GAPS = ['sm', 'md', 'lg']
export const VARIANTS = ['solid', 'outline', 'text']

export const S = {
  label: { fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' },
  input: { width: '100%', padding: '8px 10px', backgroundColor: 'var(--color-void)', border: '1px solid var(--color-line)', borderRadius: 6, color: 'var(--color-text)', fontSize: 12, fontFamily: 'var(--font-sans)', outline: 'none', transition: 'border-color 0.12s' },
  groupTitle: { fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text)', textTransform: 'uppercase' },
  btn: (active, color) => ({
    padding: '5px 10px', borderRadius: 5, border: `1px solid ${active ? (color || 'var(--color-signal)') : 'var(--color-line)'}`,
    backgroundColor: active ? (color || 'var(--color-signal)') + '18' : 'transparent',
    color: active ? (color || 'var(--color-signal)') : 'var(--color-text-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em',
    cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.1s',
  }),
}

export const defaultText = (text = '') => ({ text, color: null, weight: 400, fontSize: 'md', visible: true })

export const fsMap = { xs: '10px', sm: '13px', md: '16px', lg: '22px', xl: '30px', '2xl': '40px' }
export const padMap = { sm: '16px', md: '28px', lg: '40px', xl: '56px' }
export const gapMap = { sm: '6px', md: '12px', lg: '20px' }
export const heightMap = { full: '100%', large: '85%', medium: '65%', auto: 'auto' }
export const maxWMap = { narrow: '400px', medium: '600px', wide: '800px', full: '100%' }

export function BtnGroup({ options, value, onChange, color }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} style={S.btn(value === o, color)}>
          {typeof o === 'number' ? (
            o === 300 ? 'L' : o === 400 ? 'R' : o === 500 ? 'M' : o === 600 ? 'SB' : o === 700 ? 'B' : 'XB'
          ) : o}
        </button>
      ))}
    </div>
  )
}

export function AnchorGrid({ value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, width: 120 }}>
      {ANCHORS.map((a) => (
        <button key={a} type="button" onClick={() => onChange(a)}
          title={a}
          style={{
            width: 36, height: 24, borderRadius: 4,
            border: `1px solid ${value === a ? 'var(--color-signal)' : 'var(--color-line)'}`,
            backgroundColor: value === a ? 'rgba(62,217,196,0.12)' : 'var(--color-void)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, transition: 'all 0.1s',
          }}
        >
          <div style={{
            width: 4, height: 4, borderRadius: '50%',
            backgroundColor: value === a ? 'var(--color-signal)' : 'var(--color-text-muted)',
          }} />
        </button>
      ))}
    </div>
  )
}

export function ColorSwatch({ value, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <label style={{ ...S.label, marginBottom: 0 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type="color" value={value || '#111827'}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 28, height: 28, border: '1px solid var(--color-line)', borderRadius: 4, cursor: 'pointer', padding: 0, backgroundColor: 'transparent' }}
        />
      </div>
      <input style={{ ...S.input, width: 80, fontFamily: 'var(--font-mono)', fontSize: 10 }}
        value={value || '#111827'} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function InlineTextField({ label, value, onChange }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <input style={{ ...S.input, flex: 1, minWidth: 120 }} value={value.text || ''} placeholder={label}
          onChange={(e) => onChange({ ...value, text: e.target.value })} />
        <input type="color" value={value.color || '#ffffff'}
          onChange={(e) => onChange({ ...value, color: e.target.value })}
          style={{ width: 24, height: 24, border: '1px solid var(--color-line)', borderRadius: 3, cursor: 'pointer', padding: 0, flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: 2 }}>
          {FONT_WEIGHTS.map((w) => (
            <button key={w} type="button" onClick={() => onChange({ ...value, weight: w })}
              style={S.btn(value.weight === w)} title={`${w}`}>
              {w === 300 ? 'L' : w === 400 ? 'R' : w === 500 ? 'M' : w === 600 ? 'SB' : w === 700 ? 'B' : 'XB'}
            </button>
          ))}
        </div>
        <BtnGroup options={FONT_SIZES} value={value.fontSize}
          onChange={(fs) => onChange({ ...value, fontSize: fs })} />
      </div>
    </div>
  )
}
