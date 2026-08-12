import { S, AnchorGrid, BtnGroup, HEIGHTS, MAX_WIDTHS } from './sectionFormShared'

export default function LayoutControls({ value, onChange, showAnchor = true, showTextAlign = true }) {
  return (
    <>
      {showAnchor && (
        <div>
          <label style={S.label}>ANCHOR POSITION</label>
          <AnchorGrid value={value.anchor} onChange={(v) => onChange({ ...value, anchor: v })} />
        </div>
      )}
      {showTextAlign && (
        <div>
          <label style={S.label}>TEXT ALIGN</label>
          <BtnGroup options={['left', 'center', 'right']} value={value.text_align}
            onChange={(v) => onChange({ ...value, text_align: v })} />
        </div>
      )}
      <div>
        <label style={S.label}>HEIGHT</label>
        <BtnGroup options={HEIGHTS} value={value.height} onChange={(v) => onChange({ ...value, height: v })} />
      </div>
      <div>
        <label style={S.label}>MAX WIDTH</label>
        <BtnGroup options={MAX_WIDTHS} value={value.max_width} onChange={(v) => onChange({ ...value, max_width: v })} />
      </div>
    </>
  )
}
