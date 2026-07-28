import { useState } from 'react'
import { COLORS, FONT_MONO } from '../theme.js'
import { ProgressBar, Button, EditDeleteIcons, teamName } from './ui.jsx'

const COLUMNS = [
  { key: 'backlog', label: 'BACKLOG', color: COLORS.textMuted },
  { key: 'drafting', label: 'DRAFTING', color: COLORS.textMuted },
  { key: 'with_client', label: 'WITH CLIENT', color: COLORS.amberDark },
  { key: 'scheduled', label: 'SCHEDULED', color: COLORS.textMuted },
  { key: 'live', label: 'LIVE', color: COLORS.blueDark },
]

function ownerBadge(t, team) {
  if (t.ownerType === 'team') return { label: teamName(team, t.owner).toUpperCase(), bg: '#EEF1F6', color: COLORS.textMuted }
  if (t.ownerType === 'client') return { label: t.owner.split(' ')[0].toUpperCase(), bg: '#E3E9F5', color: COLORS.navy }
  return { label: t.owner.toUpperCase(), bg: '#FDE7D3', color: COLORS.orangeDark }
}

export default function KanbanBoard({ client, projects, tasks, team, initialProjectId, onMoveTask, onAddTask, onEditTask, onDeleteTask }) {
  const clientProjects = projects.filter(p => p.clientId === client.id)
  const [projectId, setProjectId] = useState(initialProjectId || clientProjects[0]?.id)
  const project = clientProjects.find(p => p.id === projectId) || clientProjects[0]
  const projectTasks = tasks.filter(t => t.projectId === project?.id)
  const [dragId, setDragId] = useState(null)

  function drop(columnKey) {
    if (dragId != null) onMoveTask(dragId, columnKey)
    setDragId(null)
  }

  if (!project) {
    return (
      <main style={{ padding: 32, color: COLORS.textFaint, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        This client has no projects yet.
        <Button variant="primary" onClick={() => onAddTask(client.id, null)} style={{ alignSelf: 'flex-start' }}>+ Task</Button>
      </main>
    )
  }

  return (
    <main style={{ background: COLORS.page, color: COLORS.heading, minHeight: '100%', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minWidth: 0, overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.10em', color: COLORS.textFaint }}>{client.name.toUpperCase()}</div>
          <select value={projectId} onChange={e => setProjectId(e.target.value)} style={{
            margin: '5px 0 0', font: "400 30px 'Instrument Serif',serif", border: 'none', background: 'transparent', color: COLORS.heading, cursor: 'pointer',
          }}>
            {clientProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Button variant="primary" onClick={() => onAddTask(client.id, project.id)}>+ Task</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(200px, 1fr))`, gap: 12, alignItems: 'start' }}>
        {COLUMNS.map(col => {
          const colTasks = projectTasks.filter(t => t.column === col.key)
          return (
            <div key={col.key} onDragOver={e => e.preventDefault()} onDrop={() => drop(col.key)} style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: '600 11.5px "Instrument Sans",sans-serif', color: col.color, padding: '0 2px' }}>
                <span>{col.label}</span><span>{colTasks.length}</span>
              </div>
              {colTasks.map(t => {
                const badge = ownerBadge(t, team)
                const withClient = col.key === 'with_client'
                return (
                  <div key={t.id} draggable onDragStart={() => setDragId(t.id)} style={{
                    background: withClient ? '#FFF8EC' : col.key === 'live' ? '#F1F7FC' : '#fff',
                    border: `1px solid ${withClient ? 'rgba(252,175,23,.35)' : col.key === 'live' ? 'rgba(0,111,185,.25)' : COLORS.border}`,
                    borderRadius: 9, padding: 12, cursor: 'grab',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{t.title}</div>
                      <div draggable={false}>
                        <EditDeleteIcons onEdit={() => onEditTask(t)} onDelete={() => onDeleteTask(t.id)} deleteTitle="Delete task" />
                      </div>
                    </div>
                    {t.note && (
                      <div style={{ marginTop: 8, padding: '5px 8px', borderRadius: 6, background: col.key === 'live' ? 'transparent' : '#FFF3E2', fontSize: 11, color: col.key === 'live' ? COLORS.blueDark : COLORS.amberDark }}>
                        {t.note}
                      </div>
                    )}
                    {withClient && t.progress != null && (
                      <div style={{ marginTop: 8 }}><ProgressBar pct={t.progress} height={3} color={COLORS.orange} track="rgba(252,175,23,.20)" /></div>
                    )}
                    {col.key !== 'live' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}>
                        <span style={{ padding: '2px 7px', borderRadius: 5, background: badge.bg, color: badge.color, fontSize: 10.5, fontWeight: 600 }}>{badge.label}</span>
                        <span style={{ fontSize: 11, color: t.overdueDays ? COLORS.orange : t.waitingDays ? COLORS.amberDark : COLORS.textFaint, fontWeight: t.overdueDays || t.waitingDays ? 600 : 400 }}>
                          {t.due || '—'}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
              {colTasks.length === 0 && <div style={{ fontSize: 11.5, color: COLORS.textFaint, fontStyle: 'italic', padding: '4px 2px' }}>—</div>}
            </div>
          )
        })}
      </div>
    </main>
  )
}
