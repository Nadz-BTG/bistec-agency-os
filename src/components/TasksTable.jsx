import { useState } from 'react'
import { COLORS, FONT_MONO, PRIORITY_COLOR } from '../theme.js'
import { Pill, Checkbox, Button, EditDeleteIcons, teamName } from './ui.jsx'

const COLS = '26px 26px 1.7fr 118px 118px 108px 92px 96px 1fr 68px'

export default function TasksTable({ tasks, clients, projects, team, onToggleTask, onAddTask, onEditTask, onDeleteTask, onDeleteTasks }) {
  const [filter, setFilter] = useState('week')
  const [selected, setSelected] = useState(new Set())

  const clientName = id => clients.find(c => c.id === id)?.name || id
  const projectName = id => projects.find(p => p.id === id)?.name || '—'
  const ownerLabel = t => (t.ownerType === 'team' ? teamName(team, t.owner).toUpperCase() : t.ownerType === 'client' ? 'CLIENT' : 'EXTERNAL')
  const ownerBadgeStyle = t => (
    t.ownerType === 'team'
      ? { background: '#EEF1F6', color: COLORS.textMuted }
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
    if (filter.startsWith('member:')) return t.ownerType === 'team' && t.owner === filter.slice(7)
    return true
  })

  const overdueTotal = open.filter(t => t.overdueDays).length
  const waitingTotal = open.filter(t => t.waitingDays != null).length

  function toggleOne(id) {
    setSelected(s => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleAll() {
    setSelected(s => (s.size === filtered.length ? new Set() : new Set(filtered.map(t => t.id))))
  }
  function bulkDelete() {
    onDeleteTasks([...selected])
    setSelected(new Set())
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
          {selected.size > 0 && <Button variant="danger" onClick={bulkDelete}>Delete {selected.size} selected</Button>}
          <Button variant="primary" onClick={onAddTask}>+ Task</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <Pill active={filter === 'week'} onClick={() => setFilter('week')}>Due this week</Pill>
        <Pill active={filter === 'overdue'} onClick={() => setFilter('overdue')}>Overdue</Pill>
        <Pill active={filter === 'waiting'} onClick={() => setFilter('waiting')}>Waiting on client</Pill>
        <Pill active={filter === 'blocked'} onClick={() => setFilter('blocked')}>Blocked</Pill>
        {team.map(m => (
          <Pill key={m.id} active={filter === `member:${m.id}`} onClick={() => setFilter(`member:${m.id}`)}>{m.name}'s</Pill>
        ))}
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', padding: '9px 16px', background: '#EFF3F8', borderBottom: `1px solid ${COLORS.border}`, font: `600 10px ${FONT_MONO}`, letterSpacing: '.07em', color: COLORS.textFaint }}>
          <Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onClick={toggleAll} title="Select all" />
          <div /><div>TASK</div><div>CLIENT</div><div>PROJECT</div><div>ASSIGNEE</div><div>PRIORITY</div><div>DUE</div><div>WAITING ON</div><div />
        </div>
        <div style={{ fontSize: 13 }}>
          {filtered.map((t, i) => (
            <div key={t.id} style={{
              display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', padding: '11px 16px',
              borderBottom: i < filtered.length - 1 ? `1px solid rgba(20,55,125,.06)` : 'none',
              background: t.overdueDays ? '#FFF7EE' : 'transparent',
            }}>
              <Checkbox checked={selected.has(t.id)} onClick={() => toggleOne(t.id)} />
              <Checkbox checked={t.done} color={t.overdueDays ? COLORS.orange : t.waitingDays ? COLORS.amber : undefined} onClick={() => onToggleTask(t.id)} />
              <div style={{ fontWeight: 500, cursor: 'pointer' }} onClick={() => onEditTask(t)}>{t.title}</div>
              <div style={{ color: COLORS.textMuted }}>{clientName(t.clientId)}</div>
              <div style={{ color: COLORS.textMuted }}>{projectName(t.projectId)}</div>
              <div><span style={{ padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600, ...ownerBadgeStyle(t) }}>{ownerLabel(t)}</span></div>
              <div><span style={{ color: PRIORITY_COLOR[t.priority], fontWeight: t.priority === 'High' ? 600 : 400 }}>{t.priority}</span></div>
              <div style={{ color: t.overdueDays ? COLORS.orange : t.waitingDays ? COLORS.amber : COLORS.heading, fontWeight: t.overdueDays || t.waitingDays ? 600 : 400 }}>
                {t.due || '—'}
              </div>
              <div style={{ color: COLORS.textMuted }}>{t.waitingOn ? `${t.waitingOn}${t.blocks ? ` · ${t.blocks}` : ''}` : '—'}</div>
              <EditDeleteIcons onEdit={() => onEditTask(t)} onDelete={() => onDeleteTask(t.id)} deleteTitle="Delete task" />
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 20, color: COLORS.textFaint }}>Nothing matches this filter.</div>}
        </div>
      </div>
    </main>
  )
}
