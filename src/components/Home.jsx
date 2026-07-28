import { useState } from 'react'
import { COLORS, FONT_MONO } from '../theme.js'
import { StageBadge, StatTile, Button, EditDeleteIcons, Checkbox } from './ui.jsx'

function greetingDate() {
  const d = new Date()
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()
}

export default function Home({ clients, tasks, currentUserName, onOpenClient, onNavigate, onEditClient, onDeleteClient, onDeleteClients }) {
  const [selected, setSelected] = useState(new Set())

  const overdue = tasks.filter(t => t.overdueDays).length
  const waiting = tasks.filter(t => t.waitingDays != null).length
  const dueThisWeek = tasks.filter(t => t.status === 'open' && !t.overdueDays && !t.waitingDays).length
  const shipped = tasks.filter(t => t.status === 'live').length

  const clientsWaitingOnUs = clients.filter(c => tasks.some(t => t.clientId === c.id && t.overdueDays)).length
  const clientsWaitingOnThem = clients.filter(c => tasks.some(t => t.clientId === c.id && t.waitingDays != null)).length

  const sorted = [...clients].sort((a, b) => {
    const score = c => tasks.filter(t => t.clientId === c.id && t.overdueDays).length * 10 + tasks.filter(t => t.clientId === c.id && t.waitingDays != null).length
    return score(b) - score(a)
  })

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

  return (
    <main style={{ padding: '30px 34px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1, minWidth: 0 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.10em', color: COLORS.textFaint }}>{greetingDate()}</div>
          <h1 style={{ margin: '6px 0 0', font: "400 40px/1 'Instrument Serif',serif", letterSpacing: '-.01em' }}>Morning, {currentUserName}.</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: COLORS.textMuted }}>
            {clients.length} clients live. {clientsWaitingOnUs} waiting on you, {clientsWaitingOnThem} waiting on them.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" onClick={() => onNavigate('checkins')}>Log a check-in</Button>
          <Button variant="primary" onClick={() => onNavigate('add-client')}>+ New client</Button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <StatTile label="DUE THIS WEEK" value={dueThisWeek} />
        <StatTile label="OVERDUE" value={overdue} color={COLORS.orange} />
        <StatTile label="WAITING ON CLIENT" value={waiting} color={COLORS.amber} />
        <StatTile label="SHIPPED, 7 DAYS" value={shipped} color={COLORS.blue} />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {sorted.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Checkbox checked={selected.size === sorted.length} onClick={toggleAll} title="Select all" />
                <span style={{ fontSize: 11.5, color: COLORS.textFaint }}>Select all</span>
              </div>
            )}
            <h2 style={{ margin: 0, font: '600 13px "Instrument Sans",sans-serif', letterSpacing: '.01em' }}>Client portfolio</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selected.size > 0 && (
              <Button variant="danger" onClick={() => { onDeleteClients([...selected]); setSelected(new Set()) }}>Delete {selected.size} selected</Button>
            )}
            <span style={{ fontSize: 12, color: COLORS.textFaint }}>Sorted by what needs you</span>
          </div>
        </div>
        {sorted.length === 0 && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 28, textAlign: 'center', color: COLORS.textFaint, fontSize: 13 }}>
            No clients yet. <span onClick={() => onNavigate('add-client')} style={{ color: COLORS.orange, cursor: 'pointer' }}>Add your first client →</span>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {sorted.map(c => {
            const clientTasks = tasks.filter(t => t.clientId === c.id)
            const overdueCount = clientTasks.filter(t => t.overdueDays).length
            const openCount = clientTasks.filter(t => t.status === 'open').length
            const waitingCount = clientTasks.filter(t => t.waitingDays != null).length
            const borderColor = overdueCount ? COLORS.orange : waitingCount ? COLORS.amber : c.stage === 'ONGOING' ? COLORS.blue : 'rgba(20,55,125,.18)'
            return (
              <div key={c.id} onClick={() => onOpenClient(c.id)} style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${borderColor}`,
                borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Checkbox checked={selected.has(c.id)} onClick={() => toggleOne(c.id)} />
                    <div>
                      <div style={{ font: '600 16px "Instrument Sans",sans-serif' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.textFaint, marginTop: 2 }}>{c.tagline}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <StageBadge stage={c.stage} />
                    <EditDeleteIcons onEdit={() => onEditClient(c)} onDelete={() => onDeleteClient(c)} deleteTitle="Delete client" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {c.stageProgress.map((s, i) => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: s === 'done' ? COLORS.blue : s === 'current' ? COLORS.orange : 'rgba(20,55,125,.12)',
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>{c.narrative.text}</div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: COLORS.textMuted, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
                  <span><strong style={{ color: overdueCount ? COLORS.orange : COLORS.heading }}>{overdueCount}</strong> overdue</span>
                  <span><strong>{openCount}</strong> open</span>
                  <span><strong style={{ color: waitingCount ? COLORS.amber : COLORS.heading }}>{waitingCount}</strong> waiting on them</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
