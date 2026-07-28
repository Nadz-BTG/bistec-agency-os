import { useState } from 'react'
import { COLORS, FONT_MONO, PRIORITY_COLOR, TEAM } from '../theme.js'
import { Pill, Checkbox, Button } from './ui.jsx'

const COLS = '26px 1.9fr 118px 118px 108px 92px 96px 1fr'

export default function TasksTable({ tasks, clients, projects, onToggleTask, onAddTask }) {
  const [filter, setFilter] = useState('week')
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ title: '', clientId: clients[0]?.id, owner: 'nadha', priority: 'Med', due: '' })

  const clientName = id => clients.find(c => c.id === id)?.name || id
  const projectName = id => projects.find(p => p.id === id)?.name || '—'
  const ownerLabel = t => (t.ownerType === 'team' ? (t.owner === 'nadha' ? 'NADHA' : 'DILNI') : t.ownerType === 'client' ? 'CLIENT' : 'EXTERNAL')
  const ownerBadgeStyle = t => (
    t.ownerType === 'team'
      ? { background: t.owner === 'nadha' ? '#EEF1F6' : '#DCEBF7', color: t.owner === 'nadha' ? COLORS.textMuted : COLORS.blueDark }
      : t.ownerType === 'client'
        ? { background: '#E3E9F5', color: COLORS.navy }
        : { background: '#FDE7D3', color: COLORS.orangeDark }
  )

  const open = tasks.filter(t => t.status === 'open')
  const filtered = open.filter(t => {
    if (filter === 'week') return true
    if (filter === 'overdue') return !!t.overdueDays
    if (filter === 'waiting') return t.waitingDays != null
    if (filter === 'blocked') return !!t.note && t.note.includes('blocked')
    if (filter === 'nadha') return t.ownerType === 'team' && t.owner === 'nadha'
    if (filter === 'dilni') return t.ownerType === 'team' && t.owner === 'dilni'
    return true
  })

  const overdueTotal = open.filter(t => t.overdueDays).length
  const waitingTotal = open.filter(t => t.waitingDays != null).length

  function submitTask() {
    if (!draft.title.trim()) return
    onAddTask(draft)
    setDraft({ title: '', clientId: clients[0]?.id, owner: 'nadha', priority: 'Med', due: '' })
    setAdding(false)
  }

  return (
    <main style={{ background: COLORS.page, color: COLORS.heading, minHeight: '100%', padding: '26px 32px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, font: "400 32px/1 'Instrument Serif',serif" }}>All tasks</h1>
          <p style={{ margin: '7px 0 0', fontSize: 13, color: COLORS.textMuted }}>
            {open.length} open across {clients.length} clients · {overdueTotal} overdue · {waitingTotal} waiting on client
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="primary" onClick={() => setAdding(a => !a)}>+ Task</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <Pill active={filter === 'week'} onClick={() => setFilter('week')}>Due this week</Pill>
        <Pill active={filter === 'overdue'} onClick={() => setFilter('overdue')}>Overdue</Pill>
        <Pill active={filter === 'waiting'} onClick={() => setFilter('waiting')}>Waiting on client</Pill>
        <Pill active={filter === 'blocked'} onClick={() => setFilter('blocked')}>Blocked</Pill>
        <Pill active={filter === 'nadha'} onClick={() => setFilter('nadha')}>Nadha's</Pill>
        <Pill active={filter === 'dilni'} onClick={() => setFilter('dilni')}>Dilni's</Pill>
      </div>

      {adding && (
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.borderStrong}`, borderRadius: 10, padding: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input placeholder="Task title" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })}
            style={{ flex: '1 1 220px', padding: '8px 10px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 7, fontSize: 13 }} />
          <select value={draft.clientId} onChange={e => setDraft({ ...draft, clientId: e.target.value })} style={{ padding: '8px 10px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 7, fontSize: 13 }}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={draft.owner} onChange={e => setDraft({ ...draft, owner: e.target.value })} style={{ padding: '8px 10px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 7, fontSize: 13 }}>
            {TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value })} style={{ padding: '8px 10px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 7, fontSize: 13 }}>
            <option>High</option><option>Med</option><option>Low</option>
          </select>
          <input placeholder="Due (e.g. Fri)" value={draft.due} onChange={e => setDraft({ ...draft, due: e.target.value })}
            style={{ width: 110, padding: '8px 10px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 7, fontSize: 13 }} />
          <Button variant="accent" onClick={submitTask}>Add</Button>
        </div>
      )}

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '9px 16px', background: '#EFF3F8', borderBottom: `1px solid ${COLORS.border}`, font: `600 10px ${FONT_MONO}`, letterSpacing: '.07em', color: COLORS.textFaint }}>
          <div /><div>TASK</div><div>CLIENT</div><div>PROJECT</div><div>OWNER</div><div>PRIORITY</div><div>DUE</div><div>WAITING ON</div>
        </div>
        <div style={{ fontSize: 13 }}>
          {filtered.map((t, i) => (
            <div key={t.id} onClick={() => onToggleTask(t.id)} style={{
              display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', padding: '11px 16px', cursor: 'pointer',
              borderBottom: i < filtered.length - 1 ? `1px solid rgba(20,55,125,.06)` : 'none',
              background: t.overdueDays ? '#FFF7EE' : 'transparent',
            }}>
              <Checkbox checked={t.done} color={t.overdueDays ? COLORS.orange : t.waitingDays ? COLORS.amber : undefined} />
              <div style={{ fontWeight: 500 }}>{t.title}</div>
              <div style={{ color: COLORS.textMuted }}>{clientName(t.clientId)}</div>
              <div style={{ color: COLORS.textMuted }}>{projectName(t.projectId)}</div>
              <div><span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600, ...ownerBadgeStyle(t) }}>{ownerLabel(t)}</span></div>
              <div><span style={{ color: PRIORITY_COLOR[t.priority], fontWeight: t.priority === 'High' ? 600 : 400 }}>{t.priority}</span></div>
              <div style={{ color: t.overdueDays ? COLORS.orange : t.waitingDays ? COLORS.amber : COLORS.heading, fontWeight: t.overdueDays || t.waitingDays ? 600 : 400 }}>
                {t.due || '—'}
              </div>
              <div style={{ color: COLORS.textMuted }}>{t.waitingOn ? `${t.waitingOn}${t.blocks ? ` · ${t.blocks}` : ''}` : '—'}</div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 20, color: COLORS.textFaint }}>Nothing matches this filter.</div>}
        </div>
      </div>
    </main>
  )
}
