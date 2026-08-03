import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { COLORS, FONT_MONO } from '../theme.js'
import { StageBadge, Avatar, ProgressBar, EditableField, Checkbox, Button, EditDeleteIcons, teamName } from './ui.jsx'
import { formatDate, relativeDayLabel } from '../dates.js'

const TABS = ['Overview', 'Projects', 'Tasks', 'Check-ins', 'Files']
const MAX_FILE_BYTES = 25 * 1024 * 1024

function ownerLabel(t, team) {
  if (t.ownerType === 'team') return teamName(team, t.owner)
  return t.owner
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ClientWorkspace({
  client, tasks, projects, checkins, team, isAdmin, onUpdateClient, onEditClient, onDeleteClient,
  onToggleTask, onEditTask, onDeleteTask, onDeleteTasks, onAddTask,
  onOpenAiDrawer, onOpenKanban, onOpenCheckIn,
  onAddProject, onEditProject, onDeleteProject,
  onAddFiles, onDeleteFile,
}) {
  const [tab, setTab] = useState('Overview')
  const [selectedTasks, setSelectedTasks] = useState(new Set())
  const fileInputRef = useRef(null)
  const clientFiles = client.files || []
  const clientTasks = tasks.filter(t => t.clientId === client.id)
  const clientProjects = projects.filter(p => p.clientId === client.id)
  const openCount = clientTasks.filter(t => t.status === 'open').length
  const overdueCount = clientTasks.filter(t => t.overdueDays).length
  const attention = [...clientTasks]
    .filter(t => t.status === 'open')
    .sort((a, b) => (b.overdueDays || 0) - (a.overdueDays || 0) || (b.waitingDays || 0) - (a.waitingDays || 0))
    .slice(0, 6)
  const clientCheckins = checkins.filter(ci => ci.clientId === client.id)

  function toggleOneTask(id) {
    setSelectedTasks(s => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleAllTasks() {
    setSelectedTasks(s => (s.size === clientTasks.length ? new Set() : new Set(clientTasks.map(t => t.id))))
  }
  function bulkDelete() {
    onDeleteTasks([...selectedTasks])
    setSelectedTasks(new Set())
  }

  function handleFileSelect(e) {
    const picked = Array.from(e.target.files || [])
    e.target.value = ''
    if (picked.length === 0) return
    const tooBig = picked.filter(f => f.size > MAX_FILE_BYTES)
    const ok = picked.filter(f => f.size <= MAX_FILE_BYTES)
    if (tooBig.length > 0) {
      window.alert(`${tooBig.map(f => f.name).join(', ')} — over 25MB and skipped.`)
    }
    if (ok.length > 0) onAddFiles(ok)
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      <header style={{ padding: '26px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, font: "400 36px/1 'Instrument Serif',serif" }}>{client.name}</h1>
            <StageBadge stage={client.stage} />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, color: COLORS.textMuted }}>
            Retainer · started {formatDate(client.started)} · account lead <strong style={{ color: COLORS.heading }}>{teamName(team, client.lead)}</strong> · next check-in {client.nextCheckInDate ? relativeDayLabel(client.nextCheckInDate) : 'TBC'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <EditDeleteIcons onEdit={onEditClient} onDelete={isAdmin ? onDeleteClient : undefined} deleteTitle="Delete client" />
          <Button variant="outline" onClick={() => onOpenCheckIn(client.id)}>Check-in</Button>
          <Button variant="accent" onClick={() => onOpenAiDrawer(client.id)} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', opacity: 0.9 }} />
            Ask Claude
          </Button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 22, padding: '20px 32px 0', borderBottom: `1px solid ${COLORS.border}`, font: '500 13px "Instrument Sans",sans-serif', flexWrap: 'wrap' }}>
        {TABS.map(tabName => (
          <div key={tabName} onClick={() => setTab(tabName)} style={{
            paddingBottom: 10, borderBottom: tab === tabName ? `2px solid ${COLORS.navy}` : '2px solid transparent',
            color: tab === tabName ? COLORS.heading : COLORS.textFaint, cursor: 'pointer', display: 'flex', gap: 6,
          }}>
            {tabName}
            {tabName === 'Tasks' && openCount > 0 && <span style={{ color: overdueCount ? COLORS.orange : COLORS.textFaint }}>{openCount}</span>}
          </div>
        ))}
      </div>

      {tab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, padding: '24px 32px 32px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.09em', color: COLORS.textFaint }}>THE BRIEF</div>
              <EditableField value={client.brief} onChange={v => onUpdateClient(client.id, { brief: v })} multiline fontSize={13} />
              <div style={{ height: 1, background: COLORS.border, margin: '14px 0' }} />
              <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.09em', color: COLORS.textFaint }}>ICPs</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {client.icps.map(icp => (
                  <span key={icp} style={{ padding: '4px 9px', borderRadius: 6, background: '#EEF1F6', fontSize: 11.5 }}>{icp}</span>
                ))}
                {client.icps.length === 0 && <span style={{ fontSize: 11.5, color: COLORS.textFaint, fontStyle: 'italic' }}>None yet — edit client to add</span>}
              </div>
              <div style={{ height: 1, background: COLORS.border, margin: '14px 0' }} />
              <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.09em', color: COLORS.textFaint }}>POSITIONING</div>
              <EditableField value={client.positioning} onChange={v => onUpdateClient(client.id, { positioning: v })} fontSize={13} />
            </div>

            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.09em', color: COLORS.textFaint }}>CONTACTS</div>
                <span onClick={onEditClient} style={{ fontSize: 11, color: COLORS.orange, cursor: 'pointer' }}>Edit</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {client.contacts.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Avatar name={c.name} initials={c.initials} size={26} />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.textFaint }}>{c.role}</div>
                    </div>
                  </div>
                ))}
                {client.contacts.length === 0 && <span style={{ fontSize: 11.5, color: COLORS.textFaint, fontStyle: 'italic' }}>No contacts yet</span>}
              </div>
            </div>

            <div style={{ background: COLORS.navy, color: '#EAF0F8', borderRadius: 10, padding: 16 }}>
              <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.09em', color: COLORS.textFaint }}>CLAUDE KNOWS THIS CLIENT</div>
              <p style={{ margin: '9px 0 12px', fontSize: 12.5, lineHeight: 1.55, color: '#C3D0E2' }}>
                Brief, positioning, {client.icps.length} ICPs, {clientTasks.length} tasks and {clientCheckins.length} check-ins are loaded as context.
              </p>
              <div onClick={() => onOpenAiDrawer(client.id)} style={{ padding: '8px 12px', borderRadius: 7, background: COLORS.orange, color: '#fff', font: '500 12.5px "Instrument Sans",sans-serif', textAlign: 'center', cursor: 'pointer' }}>
                Open assistant
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ font: '600 13px "Instrument Sans",sans-serif' }}>Where the engagement stands</div>
                <span style={{ fontSize: 11.5, color: COLORS.textFaint }}>updated by Claude, {client.narrative.updatedAgo}</span>
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.65, color: COLORS.text }}>{client.narrative.text}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <span onClick={() => onOpenAiDrawer(client.id, 'Draft the chase')} style={{ padding: '5px 10px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Draft the chase</span>
                <span onClick={() => onOpenAiDrawer(client.id, 'Suggest next actions')} style={{ padding: '5px 10px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Suggest next actions</span>
              </div>
            </div>

            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ font: '600 13px "Instrument Sans",sans-serif' }}>Projects</div>
                <span style={{ fontSize: 11.5, color: COLORS.orange, cursor: 'pointer' }} onClick={() => onAddProject(client.id)}>+ Add project</span>
              </div>
              <div style={{ padding: '6px 18px 14px' }}>
                {clientProjects.map((p, i) => {
                  const pct = p.total ? Math.round((p.done / p.total) * 100) : 0
                  const color = p.status === 'blocked' ? COLORS.amber : p.status === 'done' ? COLORS.blue : COLORS.orange
                  return (
                    <div key={p.id} onClick={() => onOpenKanban(client.id, p.id)} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', gap: 10,
                      borderBottom: i < clientProjects.length - 1 ? `1px solid rgba(20,55,125,.06)` : 'none', cursor: 'pointer',
                    }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 2 }}>
                          {teamName(team, p.owner)} · {p.done} of {p.total} done
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 120 }}><ProgressBar pct={pct} color={color} /></div>
                        <span style={{ fontSize: 11.5, color, fontWeight: 600, whiteSpace: 'nowrap' }}>{p.note}</span>
                        <EditDeleteIcons onEdit={() => onEditProject(p)} onDelete={() => onDeleteProject(p)} deleteTitle="Delete project" />
                      </div>
                    </div>
                  )
                })}
                {clientProjects.length === 0 && <div style={{ padding: '12px 0', fontSize: 12.5, color: COLORS.textFaint, fontStyle: 'italic' }}>No projects yet.</div>}
              </div>
            </div>

            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${COLORS.border}`, font: '600 13px "Instrument Sans",sans-serif' }}>Needs attention</div>
              <div style={{ padding: '4px 18px 14px' }}>
                {attention.length === 0 && <div style={{ padding: '11px 0', fontSize: 13, color: COLORS.textFaint }}>Nothing outstanding — nice work.</div>}
                {attention.map((t, i) => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
                    borderBottom: i < attention.length - 1 ? `1px solid rgba(20,55,125,.06)` : 'none',
                  }}>
                    <Checkbox checked={t.done} color={t.overdueDays ? COLORS.orange : t.waitingDays ? COLORS.amber : undefined} onClick={() => onToggleTask(t.id)} />
                    <div style={{ flex: 1, fontSize: 13.5, cursor: 'pointer' }} onClick={() => onEditTask(t)}>{t.title}</div>
                    <span style={{ fontSize: 11.5, color: COLORS.textFaint }}>{ownerLabel(t, team)}</span>
                    {t.overdueDays ? (
                      <span style={{ padding: '3px 8px', borderRadius: 5, background: '#FDE7D3', color: COLORS.orangeDark, font: '600 11px "Instrument Sans",sans-serif' }}>{t.overdueDays}d overdue</span>
                    ) : t.waitingDays ? (
                      <span style={{ padding: '3px 8px', borderRadius: 5, background: '#FEF1D3', color: COLORS.amberDark, font: '600 11px "Instrument Sans",sans-serif' }}>waiting {t.waitingDays}d</span>
                    ) : (
                      <span style={{ fontSize: 11.5, color: COLORS.textMuted }}>{t.due || '—'}</span>
                    )}
                    <EditDeleteIcons onEdit={() => onEditTask(t)} onDelete={() => onDeleteTask(t.id)} deleteTitle="Delete task" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Projects' && (
        <div style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={() => onAddProject(client.id)}>+ Add project</Button>
          </div>
          {clientProjects.map(p => {
            const pct = p.total ? Math.round((p.done / p.total) * 100) : 0
            return (
              <div key={p.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div onClick={() => onOpenKanban(client.id, p.id)} style={{ cursor: 'pointer', flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ marginTop: 10 }}><ProgressBar pct={pct} /></div>
                    <div style={{ marginTop: 6, fontSize: 12, color: COLORS.textMuted }}>{teamName(team, p.owner)} · {p.done} of {p.total} done · {p.note}</div>
                  </div>
                  <EditDeleteIcons onEdit={() => onEditProject(p)} onDelete={() => onDeleteProject(p)} deleteTitle="Delete project" />
                </div>
              </div>
            )
          })}
          {clientProjects.length === 0 && <div style={{ fontSize: 13, color: COLORS.textFaint }}>No projects yet.</div>}
        </div>
      )}

      {tab === 'Tasks' && (
        <div style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {clientTasks.length > 0 && (
                <>
                  <Checkbox checked={selectedTasks.size === clientTasks.length} onClick={toggleAllTasks} title="Select all" />
                  <span style={{ fontSize: 11.5, color: COLORS.textFaint }}>Select all</span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedTasks.size > 0 && <Button variant="danger" onClick={bulkDelete}>Delete {selectedTasks.size} selected</Button>}
              <Button variant="primary" onClick={() => onAddTask(client.id)}>+ Task</Button>
            </div>
          </div>
          {clientTasks.map((t, i) => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 4px',
              borderBottom: i < clientTasks.length - 1 ? `1px solid rgba(20,55,125,.06)` : 'none',
            }}>
              <Checkbox checked={selectedTasks.has(t.id)} onClick={() => toggleOneTask(t.id)} />
              <Checkbox checked={t.done} onClick={() => onToggleTask(t.id)} />
              <div style={{ flex: 1, fontSize: 13.5, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? COLORS.textFaint : COLORS.text, cursor: 'pointer' }} onClick={() => onEditTask(t)}>{t.title}</div>
              <span style={{ fontSize: 11.5, color: COLORS.textFaint }}>{ownerLabel(t, team)}</span>
              <span style={{ fontSize: 11.5, color: COLORS.textMuted }}>{t.due || '—'}</span>
              <EditDeleteIcons onEdit={() => onEditTask(t)} onDelete={() => onDeleteTask(t.id)} deleteTitle="Delete task" />
            </div>
          ))}
          {clientTasks.length === 0 && <div style={{ fontSize: 13, color: COLORS.textFaint }}>No tasks yet.</div>}
        </div>
      )}

      {tab === 'Check-ins' && (
        <div style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clientCheckins.length === 0 && <div style={{ fontSize: 13, color: COLORS.textFaint }}>No check-ins logged yet.</div>}
          {clientCheckins.map(ci => (
            <div key={ci.id} onClick={() => onOpenCheckIn(client.id)} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '14px 18px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Week of {formatDate(ci.weekStart)}</div>
                <span style={{ fontSize: 11.5, color: ci.status === 'draft' ? COLORS.amberDark : COLORS.blue }}>{ci.status === 'draft' ? 'Draft' : 'Sent'}</span>
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginTop: 6 }}>{ci.nextPriority}</div>
            </div>
          ))}
          <Button variant="outline" onClick={() => onOpenCheckIn(client.id)} style={{ alignSelf: 'flex-start' }}>+ New check-in</Button>
        </div>
      )}

      {tab === 'Files' && (
        <div style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: COLORS.textFaint }}>Shared with the whole team — up to 25MB per file.</span>
            <Button variant="primary" onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Upload size={14} /> Upload file
            </Button>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
          </div>
          {clientFiles.length === 0 && <div style={{ fontSize: 13, color: COLORS.textFaint, marginTop: 6 }}>No files uploaded yet.</div>}
          {clientFiles.map((f, i) => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 4px',
              borderBottom: i < clientFiles.length - 1 ? `1px solid rgba(20,55,125,.06)` : 'none',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 2 }}>
                  {formatBytes(f.size)} · uploaded by {f.uploadedBy} · {formatDate(f.uploadedAt)}
                </div>
              </div>
              <a href={f.dataUrl} download={f.name} title="Download" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: 6, color: COLORS.textFaint, flexShrink: 0,
              }}>
                <Download size={14} />
              </a>
              <EditDeleteIcons onDelete={() => onDeleteFile(f.id)} deleteTitle="Delete file" />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
