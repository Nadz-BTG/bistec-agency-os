import { useEffect, useRef, useState } from 'react'
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

// Scans this client's current tasks into check-in draft content. "Came in" isn't
// derivable from task state, so it's left for manual entry and never overwritten.
function generateFromTasks(clientId, tasks) {
  const clientTasks = tasks.filter(t => t.clientId === clientId)
  const wentOut = clientTasks
    .filter(t => t.status === 'live')
    .map(t => (t.note ? `${t.title} — ${t.note}` : `${t.title} — live`))
  const flagged = clientTasks
    .filter(t => t.status === 'open' && (t.overdueDays || t.waitingDays != null))
    .sort((a, b) => (b.waitingDays || b.overdueDays || 0) - (a.waitingDays || a.overdueDays || 0))
  const outstanding = flagged.map(t => (t.waitingDays != null
    ? `${t.title} — waiting ${t.waitingDays}d${t.waitingOn ? ` on ${t.waitingOn}` : ''}`
    : `${t.title} — ${t.overdueDays}d overdue`))
  const worst = flagged[0]
  const runnerUp = flagged[1]
  let nextPriority = 'Nothing urgent — keep the current pace.'
  if (worst) {
    nextPriority = `Unblock "${worst.title}"${worst.blocks ? ` — ${worst.blocks}` : ''}.`
    if (runnerUp) {
      const restCount = flagged.length - 2
      nextPriority += ` Also chase "${runnerUp.title}"${restCount > 0 ? ` and ${restCount} other flagged item${restCount > 1 ? 's' : ''}` : ''}.`
    }
  }
  return { wentOut, outstanding, nextPriority }
}

export default function CheckIn({ client, team, tasks, currentUser, checkin, onSave, onSendToClient }) {
  const generated = checkin ? null : generateFromTasks(client.id, tasks)
  const [weekStart, setWeekStart] = useState(checkin?.weekStart || todayISO())
  const [wentOut, setWentOut] = useState(checkin?.wentOut || generated?.wentOut || [])
  const [cameIn, setCameIn] = useState(checkin?.cameIn || [])
  const [outstanding, setOutstanding] = useState(checkin?.outstanding || generated?.outstanding || [])
  const [nextPriority, setNextPriority] = useState(checkin?.nextPriority || generated?.nextPriority || '')
  const [notes, setNotes] = useState(checkin?.notes || '')
  const [status, setStatus] = useState(checkin?.status || 'draft')

  function save(nextStatus) {
    setStatus(nextStatus)
    onSave({
      id: checkin?.id || `ci-${client.id}-${Date.now() % 100000}`,
      clientId: client.id,
      weekStart,
      status: nextStatus,
      loggedBy: currentUser?.id || checkin?.loggedBy || null,
      wentOut, cameIn, outstanding, nextPriority, notes,
    })
  }

  const mounted = useRef(false)
  const debounceRef = useRef(null)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(status), 800)
    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, wentOut, cameIn, outstanding, nextPriority, notes])

  function refreshFromTasks() {
    if (!window.confirm('Refresh "went out", "outstanding" and "next priority" from current tasks? Your notes and "came in" stay untouched.')) return
    const g = generateFromTasks(client.id, tasks)
    setWentOut(g.wentOut)
    setOutstanding(g.outstanding)
    setNextPriority(g.nextPriority)
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span onClick={refreshFromTasks} style={{ fontSize: 11.5, color: COLORS.orange, cursor: 'pointer' }}>↻ Refresh from tasks</span>
          <div style={{ padding: '7px 12px', borderRadius: 7, background: '#FEF1D3', color: COLORS.amberDark, font: '600 11.5px "Instrument Sans",sans-serif' }}>
            {status === 'sent' ? 'Sent' : 'Draft · autosaving'}
          </div>
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
        <span style={{ fontSize: 12, color: COLORS.textFaint }}>
          Logged by {currentUser?.name || 'you'} · {teamName(team, team.find(m => m.id !== client.lead)?.id || client.lead)} will see this in their Monday digest.
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" onClick={() => { save('sent'); onSendToClient() }}>Send to client</Button>
          <Button variant="primary" onClick={() => save('draft')}>Save check-in</Button>
        </div>
      </div>
    </main>
  )
}
