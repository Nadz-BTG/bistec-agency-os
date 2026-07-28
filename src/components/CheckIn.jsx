import { useState } from 'react'
import { COLORS, FONT_MONO } from '../theme.js'
import { todayISO } from '../dates.js'
import { Button, teamName, inputStyle } from './ui.jsx'

function EditableList({ items, onChange, placeholder, color }) {
  const [draft, setDraft] = useState('')
  function add() {
    if (!draft.trim()) return
    onChange([...items, draft.trim()])
    setDraft('')
  }
  return (
    <div>
      <ul style={{ margin: '9px 0 0', paddingLeft: 17, fontSize: 13, lineHeight: 1.7, color: COLORS.text }}>
        {items.map((it, i) => (
          <li key={i} onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ cursor: 'pointer' }} title="Click to remove">{it}</li>
        ))}
      </ul>
      <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        placeholder={placeholder} style={{
          width: '100%', marginTop: 6, padding: '5px 8px', border: `1px dashed ${COLORS.borderStrong}`, borderRadius: 6,
          fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box', color,
        }} />
    </div>
  )
}

export default function CheckIn({ client, team, checkin, onSave, onSendToClient }) {
  const [weekStart, setWeekStart] = useState(checkin?.weekStart || todayISO())
  const [wentOut, setWentOut] = useState(checkin?.wentOut || [])
  const [cameIn, setCameIn] = useState(checkin?.cameIn || [])
  const [outstanding, setOutstanding] = useState(checkin?.outstanding || [])
  const [nextPriority, setNextPriority] = useState(checkin?.nextPriority || '')
  const [notes, setNotes] = useState(checkin?.notes || '')

  function save(status) {
    onSave({
      id: checkin?.id || `ci-${client.id}-${Date.now() % 100000}`,
      clientId: client.id,
      weekStart,
      status,
      wentOut, cameIn, outstanding, nextPriority, notes,
    })
  }

  return (
    <main style={{ background: COLORS.page, color: COLORS.heading, minHeight: '100%', padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 18, flex: 1, minWidth: 0, maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.10em', color: COLORS.textFaint, display: 'flex', alignItems: 'center', gap: 8 }}>
            {client.name.toUpperCase()} · WEEK OF
            <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} style={{ ...inputStyle, width: 140, padding: '3px 6px', font: `500 10px ${FONT_MONO}`, letterSpacing: '.05em' }} />
          </div>
          <h1 style={{ margin: '6px 0 0', font: "400 30px/1 'Instrument Serif',serif" }}>Check-in</h1>
        </div>
        <div style={{ padding: '7px 12px', borderRadius: 7, background: '#FEF1D3', color: COLORS.amberDark, font: '600 11.5px "Instrument Sans",sans-serif' }}>
          {checkin?.status === 'sent' ? 'Sent' : 'Draft'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '15px 17px' }}>
          <div style={{ font: '600 12px "Instrument Sans",sans-serif', color: COLORS.blueDark }}>WHAT WENT OUT</div>
          <EditableList items={wentOut} onChange={setWentOut} placeholder="+ add an item…" color={COLORS.blueDark} />
        </div>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '15px 17px' }}>
          <div style={{ font: '600 12px "Instrument Sans",sans-serif', color: COLORS.navy }}>WHAT CAME IN</div>
          <EditableList items={cameIn} onChange={setCameIn} placeholder="+ add an item…" color={COLORS.navy} />
        </div>
        <div style={{ background: COLORS.card, border: '1px solid rgba(252,175,23,.35)', borderRadius: 10, padding: '15px 17px' }}>
          <div style={{ font: '600 12px "Instrument Sans",sans-serif', color: COLORS.amberDark }}>STILL OUTSTANDING</div>
          <EditableList items={outstanding} onChange={setOutstanding} placeholder="+ add an item…" color={COLORS.amberDark} />
        </div>
        <div style={{ background: COLORS.navy, color: '#EAF0F8', borderRadius: 10, padding: '15px 17px' }}>
          <div style={{ font: '600 12px "Instrument Sans",sans-serif', color: '#F9A05B' }}>NEXT WEEK'S PRIORITY</div>
          <textarea value={nextPriority} onChange={e => setNextPriority(e.target.value)} rows={4} placeholder="What matters most next week…"
            style={{ width: '100%', marginTop: 9, padding: '7px 9px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 6, color: '#DCE5F1', fontSize: 13, lineHeight: 1.6, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '15px 17px' }}>
        <div style={{ font: '600 12.5px "Instrument Sans",sans-serif' }}>Notes</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Anything else worth remembering…"
          style={{ width: '100%', marginTop: 8, padding: '6px 8px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 13, lineHeight: 1.6, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontSize: 12, color: COLORS.textFaint }}>{teamName(team, team.find(m => m.id !== client.lead)?.id || client.lead)} will see this in their Monday digest.</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" onClick={() => { save('sent'); onSendToClient() }}>Send to client</Button>
          <Button variant="primary" onClick={() => save('draft')}>Save check-in</Button>
        </div>
      </div>
    </main>
  )
}
