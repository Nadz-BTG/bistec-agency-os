import { useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { COLORS, FONT_MONO, STAGE_STYLES } from '../theme.js'

export function StageBadge({ stage }) {
  const s = STAGE_STYLES[stage] || STAGE_STYLES.STRATEGY
  return (
    <span style={{ padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.text, font: '600 10.5px "Instrument Sans",sans-serif' }}>
      {stage}
    </span>
  )
}

export function teamMember(team, id) {
  return team.find(m => m.id === id || m.name === id)
}

export function teamName(team, id) {
  const m = teamMember(team, id)
  return m ? m.name : id
}

export function Avatar({ name, initials, team = [], size = 24 }) {
  const member = teamMember(team, name)
  const bg = member ? member.color : '#DDE3EC'
  const color = member ? member.textColor : '#5A6A82'
  const label = initials || member?.initials || (name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?')
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, color,
      display: 'grid', placeItems: 'center', font: `600 ${Math.round(size * 0.42)}px 'Instrument Sans',sans-serif`, flexShrink: 0,
    }}>
      {label}
    </div>
  )
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
    danger: { background: '#FDE7D3', color: COLORS.orangeDark },
  }
  const disabledStyle = rest.disabled ? { opacity: 0.45, cursor: 'default', pointerEvents: 'none' } : null
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant], ...disabledStyle, ...style }} {...rest}>
      {children}
    </button>
  )
}

const ICON_TONES = {
  default: COLORS.textFaint,
  danger: COLORS.orangeDark,
  light: '#9FB2CC',
  'light-danger': '#F9A05B',
}

export function IconButton({ icon: Icon, onClick, tone = 'default', title, size = 14 }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(e) }}
      onMouseDown={e => e.stopPropagation()}
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', flexShrink: 0,
        color: ICON_TONES[tone],
      }}
    >
      <Icon size={size} />
    </button>
  )
}

export function EditDeleteIcons({ onEdit, onDelete, deleteTitle = 'Delete', light = false }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {onEdit && <IconButton icon={Pencil} onClick={onEdit} tone={light ? 'light' : 'default'} title="Edit" />}
      {onDelete && <IconButton icon={Trash2} onClick={onDelete} tone={light ? 'light-danger' : 'danger'} title={deleteTitle} />}
    </div>
  )
}

export function Checkbox({ checked, color = 'rgba(20,55,125,.30)', onClick, title }) {
  return (
    <div
      onClick={onClick ? e => { e.stopPropagation(); onClick(e) } : undefined}
      title={title}
      style={{
        width: 14, height: 14, borderRadius: 4, border: `1.5px solid ${color}`,
        background: checked ? color : 'transparent', flexShrink: 0, cursor: onClick ? 'pointer' : 'default',
      }}
    />
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

export function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'block', fontSize: 12, color: COLORS.textFaint, marginBottom: 14 }}>
      {label} {hint && <span style={{ fontStyle: 'italic', color: COLORS.textFaint }}>{hint}</span>}
      <div style={{ marginTop: 5 }}>{children}</div>
    </label>
  )
}

export const inputStyle = {
  width: '100%', padding: '8px 11px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 7,
  fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
}

export const textareaStyle = { ...inputStyle, resize: 'vertical', lineHeight: 1.6 }

export function TagListEditor({ items, onChange, placeholder = '+ add', tone = 'default' }) {
  const [draft, setDraft] = useState('')
  function add() {
    if (!draft.trim()) return
    onChange([...items, draft.trim()])
    setDraft('')
  }
  function remove(i) {
    onChange(items.filter((_, j) => j !== i))
  }
  const chipStyle = tone === 'danger'
    ? { background: '#FDE7D3', color: COLORS.orangeDark }
    : { background: '#EEF1F6', color: COLORS.heading }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((it, i) => (
        <span key={`${it}-${i}`} onClick={() => remove(i)} style={{ padding: '4px 9px', borderRadius: 6, fontSize: 11.5, cursor: 'pointer', ...chipStyle }}>{it} ✕</span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        placeholder={placeholder}
        style={{ border: `1px dashed ${COLORS.borderStrong}`, borderRadius: 6, padding: '4px 9px', fontSize: 11.5, width: 110 }}
      />
    </div>
  )
}

export function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,55,125,.34)' }} />
      <div style={{
        position: 'relative', width: `min(${width}px, 100%)`, maxHeight: '86vh', overflowY: 'auto',
        background: '#fff', borderRadius: 12, boxShadow: '0 12px 40px rgba(20,55,125,.25)', padding: '22px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ font: '600 15px "Instrument Sans",sans-serif', color: COLORS.heading }}>{title}</div>
          <div onClick={onClose} style={{ cursor: 'pointer', color: COLORS.textFaint }}><X size={18} /></div>
        </div>
        {children}
      </div>
    </div>
  )
}
