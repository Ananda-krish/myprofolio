import { S, BtnGroup, PADDINGS, GAPS } from './sectionFormShared'

export default function SpacingControls({ value, onChange }) {
  return (
    <>
      <div>
        <label style={S.label}>PADDING</label>
        <BtnGroup options={PADDINGS} value={value.padding} onChange={(v) => onChange({ ...value, padding: v })} />
      </div>
      <div>
        <label style={S.label}>ELEMENT GAP</label>
        <BtnGroup options={GAPS} value={value.element_gap} onChange={(v) => onChange({ ...value, element_gap: v })} />
      </div>
    </>
  )
}
