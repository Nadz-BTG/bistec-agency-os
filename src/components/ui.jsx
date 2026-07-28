import { useState } from 'react'
import { COLORS, FONT_MONO, STAGE_STYLES, TEAM } from '../theme.js'

export function StageBadge({ stage }) {
  const s = STAGE_STYLES[stage] || STAGE_STYLES.STRATEGY
  return (
    <span style={{ padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.text, font: '600 10.5px "Instrument Sans",sans-serif' }}>
      {stage}
    </span>
  )
}

export function Avatar({ name, initials, size = 24 }) {
  const member = TEAM.find(m => m.name === name || m.id === name)
  const bg = member ? member.color : '#DDE3EC'
  const color = member ? member.textColor : '#5A6A82'
  const label = initials || (name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?')
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, color,
      display: 'grid', placeItems: 'center', font: `600 ${Math.round(size * 0.42)}px 'Instrument Sans',sans-serif`, flexShrink: 0,
    }}>
      {label}
    </div>
  )
}

export function ownerDisplayName(id) {
  const member = TEAM.find(m => m.id === id)
  return member ? member.name : id
}

export function ProgressBar({ pct, color = COLORS.blue, height = 5, track = 'rgba(20,55,125,.10)' }) {
  return (
    <div style={{ width: '100%', height, borderRadius: height / 2, background: track }}>
      <div style={{ width: `${pct}%`, height, borderRadius: height / 2, background: color }} />
    </div>
  )
}

export function StatTile({ label, value, color = COLORS.heading }) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.08em', color: COLORS.textFaint }}>{label}</div>
      <div style={{ font: "400 32px 'Instrument Serif',serif", marginTop: 4, color }}>{value}</div>
    </div>
  )
}

export function Pill({ children, active, onClick, dashed }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: active ? 600 : 400,
      background: active ? COLORS.navy : '#fff',
      color: active ? '#fff' : COLORS.textMuted,
      border: dashed ? '1px dashed rgba(20,55,125,.22)' : `1px solid ${active ? COLORS.navy : 'rgba(20,55,125,.12)'}`,
      cursor: 'pointer',
    }}>
      {children}
    </button>
  )
}

export function Card({ children, style }) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, ...style }}>
      {children}
    </div>
  )
}

export function Button({ children, onClick, variant = 'primary', style, ...rest }) {
  const base = { padding: '9px 14px', borderRadius: 8, font: '500 13px "Instrument Sans",sans-serif', border: 'none', cursor: 'pointer' }
  const variants = {
    primary: { background: COLORS.navy, color: '#fff' },
    accent: { background: COLORS.orange, color: '#fff' },
    outline: { background: 'transparent', color: COLORS.heading, border: `1px solid ${COLORS.borderStrong}` },
    ghost: { background: 'transparent', color: COLORS.textFaint, border: 'none' },
  }
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  )
}

export function EditableField({ value, onChange, multiline, fontSize = 13 }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function save() {
    setEditing(false)
    if (draft !== value) onChange(draft)
  }

  if (editing) {
    const shared = {
      value: draft,
      onChange: e => setDraft(e.target.value),
      autoFocus: true,
      onBlur: save,
      style: {
        width: '100%', padding: '6px 9px', border: `1.5px solid ${COLORS.navy}`, borderRadius: 6,
        fontSize, fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box', outline: 'none',
        resize: multiline ? 'vertical' : 'none',
      },
    }
    return multiline
      ? <textarea rows={3} {...shared} onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) save() }} />
      : <input {...shared} onKeyDown={e => { if (e.key === 'Enter') save() }} />
  }

  return (
    <p onClick={() => setEditing(true)} style={{ margin: '8px 0 0', fontSize, lineHeight: 1.6, color: COLORS.text, cursor: 'text' }}>
      {value || <span style={{ color: COLORS.textFaint, fontStyle: 'italic' }}>Click to add…</span>}
    </p>
  )
}

export function Checkbox({ checked, color = 'rgba(20,55,125,.30)' }) {
  return (
    <div style={{
      width: 14, height: 14, borderRadius: 4, border: `1.5px solid ${checked ? color : color}`,
      background: checked ? color : 'transparent', flexShrink: 0,
    }} />
  )
}
