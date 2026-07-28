import { useState } from 'react'
import { COLORS } from '../theme.js'
import { Button, Checkbox, IconButton } from './ui.jsx'
import { Trash2 } from 'lucide-react'

export default function CheckinsHub({ clients, checkins, onOpenCheckIn, onDeleteCheckIn, onDeleteCheckIns }) {
  const [selected, setSelected] = useState(new Set())
  const sorted = [...checkins].reverse()

  function toggleOne(id) {
    setSelected(s => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleAll() {
    setSelected(s => (s.size === sorted.length ? new Set() : new Set(sorted.map(c => c.id))))
  }
  function bulkDelete() {
    onDeleteCheckIns([...selected])
    setSelected(new Set())
  }

  return (
    <main style={{ background: COLORS.page, color: COLORS.heading, minHeight: '100%', padding: '30px 34px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, font: "400 32px/1 'Instrument Serif',serif" }}>Check-ins</h1>
          <p style={{ margin: '7px 0 0', fontSize: 13, color: COLORS.textMuted }}>{checkins.length} logged across {clients.length} clients.</p>
        </div>
        {selected.size > 0 && <Button variant="danger" onClick={bulkDelete}>Delete {selected.size} selected</Button>}
      </div>

      {sorted.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Checkbox checked={selected.size === sorted.length} onClick={toggleAll} title="Select all" />
          <span style={{ fontSize: 11.5, color: COLORS.textFaint }}>Select all</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.length === 0 && <div style={{ fontSize: 13, color: COLORS.textFaint }}>No check-ins logged yet — start one from a client workspace.</div>}
        {sorted.map(ci => {
          const client = clients.find(c => c.id === ci.clientId)
          if (!client) return null
          return (
            <div key={ci.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Checkbox checked={selected.has(ci.id)} onClick={() => toggleOne(ci.id)} />
              <div onClick={() => onOpenCheckIn(ci.clientId)} style={{ flex: 1, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{client.name} <span style={{ fontWeight: 400, color: COLORS.textFaint, fontSize: 12.5 }}>· {ci.week}</span></div>
                  <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginTop: 4, maxWidth: 560 }}>{ci.nextPriority}</div>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: ci.status === 'sent' ? COLORS.blueDark : COLORS.amberDark, flexShrink: 0 }}>{ci.status === 'sent' ? 'Sent' : 'Draft'}</span>
              </div>
              <IconButton icon={Trash2} tone="danger" onClick={() => onDeleteCheckIn(ci.id)} title="Delete check-in" />
            </div>
          )
        })}
      </div>

      <div>
        <div style={{ fontSize: 12, color: COLORS.textFaint, marginBottom: 8 }}>Start a new check-in</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {clients.map(c => (
            <Button key={c.id} variant="outline" onClick={() => onOpenCheckIn(c.id)}>{c.name}</Button>
          ))}
          {clients.length === 0 && <span style={{ fontSize: 12.5, color: COLORS.textFaint, fontStyle: 'italic' }}>Add a client first.</span>}
        </div>
      </div>
    </main>
  )
}
