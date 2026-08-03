import { useEffect, useState } from 'react'
import { dueLabelFor, overdueDaysFor, waitingDaysFor, todayISO } from './dates.js'
import { supabase, FILES_BUCKET } from './supabaseClient.js'
import Login from './components/Login.jsx'
import UpdatePassword from './components/UpdatePassword.jsx'
import Sidebar from './components/Sidebar.jsx'
import Home from './components/Home.jsx'
import ClientWorkspace from './components/ClientWorkspace.jsx'
import TasksTable from './components/TasksTable.jsx'
import ChaseQueue from './components/ChaseQueue.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'
import AiDrawer from './components/AiDrawer.jsx'
import AddClientWizard from './components/AddClientWizard.jsx'
import CheckIn from './components/CheckIn.jsx'
import CheckinsHub from './components/CheckinsHub.jsx'
import { EditClientModal, EditTeamMemberModal, EditProjectModal, EditTaskModal } from './components/Modals.jsx'

const EMPTY_STATE = { team: [], clients: [], projects: [], tasks: [], checkins: [] }
const TABLE_KEY = { team_members: 'team', clients: 'clients', projects: 'projects', tasks: 'tasks', checkins: 'checkins' }

function newId(prefix) { return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}` }

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = not checked yet, null = signed out
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [state, setState] = useState(EMPTY_STATE)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState('saved')
  const [syncError, setSyncError] = useState(null)
  const [view, setView] = useState('home')
  const [activeClientId, setActiveClientId] = useState(null)
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [aiDrawer, setAiDrawer] = useState({ open: false, clientId: null, initialPrompt: '', nonce: 0 })

  const [clientModal, setClientModal] = useState(null)
  const [teamModal, setTeamModal] = useState(null)
  const [projectModal, setProjectModal] = useState(null)
  const [taskModal, setTaskModal] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
      setSession(next)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setState(EMPTY_STATE); setDataLoaded(false); return }
    let cancelled = false
    Promise.all([
      supabase.from('team_members').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('checkins').select('*'),
    ]).then(([tm, cl, pr, tk, ck]) => {
      if (cancelled) return
      setState({ team: tm.data || [], clients: cl.data || [], projects: pr.data || [], tasks: tk.data || [], checkins: ck.data || [] })
      setDataLoaded(true)
    })
    return () => { cancelled = true }
  }, [session])

  useEffect(() => {
    if (!session) return
    const channel = supabase.channel('agency-os-realtime')
    Object.keys(TABLE_KEY).forEach(table => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
        const key = TABLE_KEY[table]
        setState(s => {
          if (payload.eventType === 'INSERT') {
            if (s[key].some(r => r.id === payload.new.id)) return s
            return { ...s, [key]: [...s[key], payload.new] }
          }
          if (payload.eventType === 'UPDATE') return { ...s, [key]: s[key].map(r => (r.id === payload.new.id ? payload.new : r)) }
          if (payload.eventType === 'DELETE') return { ...s, [key]: s[key].filter(r => r.id !== payload.old.id) }
          return s
        })
      })
    })
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [session])

  function sync(promise) {
    setSaveStatus('saving')
    Promise.resolve(promise).then(({ error }) => {
      if (error) {
        console.error(error)
        setSaveStatus('error')
        setSyncError(error.message || 'Unknown error saving to the database.')
        return
      }
      setSyncError(null)
      setSaveStatus('saved')
    }).catch(err => {
      console.error(err)
      setSaveStatus('error')
      setSyncError(err.message || 'Network error reaching the database.')
    })
  }

  const { clients, projects, checkins, team } = state
  const tasks = state.tasks.map(t => ({ ...t, due: dueLabelFor(t), overdueDays: overdueDaysFor(t), waitingDays: waitingDaysFor(t) }))
  const activeClient = clients.find(c => c.id === activeClientId) || null
  const currentUser = team.find(m => m.userId === session?.user?.id) || null

  const counts = {
    mine: tasks.filter(t => t.status === 'open' && t.ownerType === 'team' && t.owner === currentUser?.id).length,
    waiting: tasks.filter(t => t.waitingDays != null && !t.snoozed).length,
  }

  function navigate(nextView, clientId) { setView(nextView); if (clientId) setActiveClientId(clientId) }
  function openClient(id) { navigate('client', id) }
  function openKanban(clientId, projectId) { setActiveProjectId(projectId); navigate('kanban', clientId) }
  function openCheckIn(clientId) { navigate('checkin', clientId) }
  function openAiDrawer(clientId, initialPrompt = '') { setAiDrawer(d => ({ open: true, clientId, initialPrompt, nonce: d.nonce + 1 })) }
  function closeAiDrawer() { setAiDrawer(d => ({ ...d, open: false })) }

  // ---- tasks ----
  function toggleTask(id) {
    const t = state.tasks.find(x => x.id === id)
    if (!t) return
    const patch = { done: !t.done, status: !t.done ? 'done' : 'open' }
    setState(s => ({ ...s, tasks: s.tasks.map(x => (x.id === id ? { ...x, ...patch } : x)) }))
    sync(supabase.from('tasks').update(patch).eq('id', id))
  }

  function addTask(draft) {
    const row = {
      id: newId('t'), projectId: null, dueDate: null, askedDate: null, waitingOn: null, blocks: null,
      chasedCount: 0, cold: false, column: 'backlog', status: 'open', progress: null, note: null, done: false,
      ownerType: 'team', priority: 'Med', assignedBy: currentUser?.id || null, snoozed: false,
      ...draft,
    }
    setState(s => ({ ...s, tasks: [...s.tasks, row] }))
    sync(supabase.from('tasks').insert(row))
  }

  function updateTask(id, patch) {
    const existing = state.tasks.find(t => t.id === id)
    const reassigned = existing && 'owner' in patch && patch.owner !== existing.owner
    const fullPatch = { ...patch, ...(reassigned ? { assignedBy: currentUser?.id || null } : {}) }
    setState(s => ({ ...s, tasks: s.tasks.map(t => (t.id === id ? { ...t, ...fullPatch } : t)) }))
    sync(supabase.from('tasks').update(fullPatch).eq('id', id))
  }

  function deleteTask(id) {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }))
    sync(supabase.from('tasks').delete().eq('id', id))
  }

  function deleteTasks(ids) {
    const idSet = new Set(ids)
    setState(s => ({ ...s, tasks: s.tasks.filter(t => !idSet.has(t.id)) }))
    sync(supabase.from('tasks').delete().in('id', ids))
  }

  function moveTask(id, column) {
    setState(s => ({ ...s, tasks: s.tasks.map(t => (t.id === id ? { ...t, column } : t)) }))
    sync(supabase.from('tasks').update({ column }).eq('id', id))
  }

  function snoozeChase(id) {
    setState(s => ({ ...s, tasks: s.tasks.map(t => (t.id === id ? { ...t, snoozed: true } : t)) }))
    sync(supabase.from('tasks').update({ snoozed: true }).eq('id', id))
  }

  function draftChase(clientId, taskTitle) { openAiDrawer(clientId, `Draft a chase for: ${taskTitle}`) }

  // ---- clients ----
  function updateClient(id, patch) {
    setState(s => ({ ...s, clients: s.clients.map(c => (c.id === id ? { ...c, ...patch } : c)) }))
    sync(supabase.from('clients').update(patch).eq('id', id))
  }

  function saveClient(clientData) {
    setState(s => {
      const exists = s.clients.some(c => c.id === clientData.id)
      return { ...s, clients: exists ? s.clients.map(c => (c.id === clientData.id ? clientData : c)) : [...s.clients, clientData] }
    })
    sync(supabase.from('clients').upsert(clientData))
  }

  function deleteClient(id) {
    setState(s => ({
      ...s,
      clients: s.clients.filter(c => c.id !== id),
      projects: s.projects.filter(p => p.clientId !== id),
      tasks: s.tasks.filter(t => t.clientId !== id),
      checkins: s.checkins.filter(ci => ci.clientId !== id),
    }))
    sync(supabase.from('clients').delete().eq('id', id))
    if (activeClientId === id) { setActiveClientId(null); navigate('home') }
  }

  function deleteClients(ids) {
    const idSet = new Set(ids)
    setState(s => ({
      ...s,
      clients: s.clients.filter(c => !idSet.has(c.id)),
      projects: s.projects.filter(p => !idSet.has(p.clientId)),
      tasks: s.tasks.filter(t => !idSet.has(t.clientId)),
      checkins: s.checkins.filter(ci => !idSet.has(ci.clientId)),
    }))
    sync(supabase.from('clients').delete().in('id', ids))
    if (activeClientId && idSet.has(activeClientId)) { setActiveClientId(null); navigate('home') }
  }

  function createClientFromWizard({ client, projects: newProjects, tasks: newTasks }) {
    const fullTasks = newTasks.map((t, i) => ({
      id: `t-${client.id}-${i}-${Date.now()}`, dueDate: null, askedDate: null, waitingOn: null, blocks: null,
      chasedCount: 0, cold: false, status: 'open', progress: null, note: null, done: false, ownerType: 'team', snoozed: false, ...t,
    }))
    setState(s => ({ ...s, clients: [...s.clients, client], projects: [...s.projects, ...newProjects], tasks: [...s.tasks, ...fullTasks] }))
    sync(supabase.from('clients').insert(client))
    sync(supabase.from('projects').insert(newProjects))
    sync(supabase.from('tasks').insert(fullTasks))
    navigate('client', client.id)
  }

  // ---- projects ----
  function addProject(clientId, fields) {
    const row = { id: newId('p'), clientId, ...fields }
    setState(s => ({ ...s, projects: [...s.projects, row] }))
    sync(supabase.from('projects').insert(row))
  }

  function updateProject(id, patch) {
    setState(s => ({ ...s, projects: s.projects.map(p => (p.id === id ? { ...p, ...patch } : p)) }))
    sync(supabase.from('projects').update(patch).eq('id', id))
  }

  function deleteProject(id) {
    setState(s => ({ ...s, projects: s.projects.filter(p => p.id !== id), tasks: s.tasks.filter(t => t.projectId !== id) }))
    sync(supabase.from('projects').delete().eq('id', id))
  }

  // ---- check-ins ----
  function saveCheckIn(checkin) {
    setState(s => {
      const exists = s.checkins.some(c => c.id === checkin.id)
      return { ...s, checkins: exists ? s.checkins.map(c => (c.id === checkin.id ? checkin : c)) : [...s.checkins, checkin] }
    })
    sync(supabase.from('checkins').upsert(checkin))
  }

  function deleteCheckIn(id) {
    setState(s => ({ ...s, checkins: s.checkins.filter(c => c.id !== id) }))
    sync(supabase.from('checkins').delete().eq('id', id))
  }

  function deleteCheckIns(ids) {
    const idSet = new Set(ids)
    setState(s => ({ ...s, checkins: s.checkins.filter(c => !idSet.has(c.id)) }))
    sync(supabase.from('checkins').delete().in('id', ids))
  }

  // ---- team ----
  // Team members are created automatically on sign-up (see the Postgres
  // trigger in supabase/schema.sql) — this only ever edits an existing row.
  function saveTeamMember(memberData) {
    setState(s => ({ ...s, team: s.team.map(m => (m.id === memberData.id ? memberData : m)) }))
    sync(supabase.from('team_members').update(memberData).eq('id', memberData.id))
  }

  function deleteTeamMember(id) {
    setState(s => ({ ...s, team: s.team.filter(m => m.id !== id) }))
    sync(supabase.from('team_members').delete().eq('id', id))
  }

  function logout() { supabase.auth.signOut() }

  // ---- files (Supabase Storage) ----
  async function addFilesToClient(clientId, pickedFiles) {
    setSaveStatus('saving')
    const entries = []
    const failed = []
    for (const f of pickedFiles) {
      const path = `${clientId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${f.name}`
      const { error: upErr } = await supabase.storage.from(FILES_BUCKET).upload(path, f)
      if (upErr) { console.error(upErr); failed.push(`${f.name}: ${upErr.message}`); continue }
      const { data: pub } = supabase.storage.from(FILES_BUCKET).getPublicUrl(path)
      entries.push({ id: path, name: f.name, size: f.size, type: f.type, dataUrl: pub.publicUrl, uploadedBy: currentUser?.name || 'Someone', uploadedAt: todayISO() })
    }
    if (failed.length) { setSaveStatus('error'); setSyncError(`Upload failed — ${failed.join('; ')}`) }
    if (entries.length === 0) { if (!failed.length) setSaveStatus('saved'); return }
    const client = state.clients.find(c => c.id === clientId)
    const files = [...(client?.files || []), ...entries]
    setState(s => ({ ...s, clients: s.clients.map(c => (c.id === clientId ? { ...c, files } : c)) }))
    sync(supabase.from('clients').update({ files }).eq('id', clientId))
  }

  function deleteFile(clientId, fileId) {
    const client = state.clients.find(c => c.id === clientId)
    const files = (client?.files || []).filter(f => f.id !== fileId)
    setState(s => ({ ...s, clients: s.clients.map(c => (c.id === clientId ? { ...c, files } : c)) }))
    sync(supabase.from('clients').update({ files }).eq('id', clientId))
    supabase.storage.from(FILES_BUCKET).remove([fileId])
  }

  const activeCheckIn = activeClient
    ? [...checkins].reverse().find(c => c.clientId === activeClient.id && c.status === 'draft') || null
    : null

  if (session === undefined) return null
  if (passwordRecovery) return <UpdatePassword onDone={() => setPasswordRecovery(false)} />
  if (!session) return <Login />
  if (!dataLoaded) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#7C8BA1', fontSize: 13 }}>Loading workspace…</div>
  }

  const isAdmin = !!currentUser?.isAdmin

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        view={view}
        onNavigate={navigate}
        clients={clients}
        activeClientId={activeClientId}
        counts={counts}
        team={team}
        currentUser={currentUser}
        saveStatus={saveStatus}
        syncError={syncError}
        onDismissSyncError={() => setSyncError(null)}
        onLogout={logout}
        onEditTeamMember={m => setTeamModal({ isNew: false, data: m })}
        onDeleteTeamMember={m => {
          if (window.confirm(`Remove ${m.name} from the team?`)) deleteTeamMember(m.id)
        }}
      />

      {view === 'home' && (
        <Home
          clients={clients}
          tasks={tasks}
          currentUserName={currentUser?.name || 'there'}
          isAdmin={isAdmin}
          onOpenClient={openClient}
          onNavigate={navigate}
          onEditClient={c => setClientModal({ isNew: false, data: c })}
          onDeleteClient={c => {
            if (window.confirm(`Delete ${c.name}? This removes all its projects, tasks and check-ins.`)) deleteClient(c.id)
          }}
          onDeleteClients={ids => {
            if (window.confirm(`Delete ${ids.length} client(s) and all their projects, tasks and check-ins?`)) deleteClients(ids)
          }}
        />
      )}

      {view === 'client' && activeClient && (
        <ClientWorkspace
          client={activeClient}
          tasks={tasks}
          projects={projects}
          checkins={checkins}
          team={team}
          isAdmin={isAdmin}
          onUpdateClient={updateClient}
          onAddFiles={files => addFilesToClient(activeClient.id, files)}
          onDeleteFile={fileId => { if (window.confirm('Delete this file?')) deleteFile(activeClient.id, fileId) }}
          onEditClient={() => setClientModal({ isNew: false, data: activeClient })}
          onDeleteClient={() => {
            if (window.confirm(`Delete ${activeClient.name}? This removes all its projects, tasks and check-ins.`)) deleteClient(activeClient.id)
          }}
          onToggleTask={toggleTask}
          onEditTask={t => setTaskModal({ isNew: false, data: t })}
          onDeleteTask={id => { if (window.confirm('Delete this task?')) deleteTask(id) }}
          onDeleteTasks={ids => { if (window.confirm(`Delete ${ids.length} task(s)?`)) deleteTasks(ids) }}
          onAddTask={clientId => setTaskModal({ isNew: true, data: null, fixedClientId: clientId })}
          onOpenAiDrawer={openAiDrawer}
          onOpenKanban={openKanban}
          onOpenCheckIn={openCheckIn}
          onAddProject={clientId => setProjectModal({ isNew: true, data: null, clientId })}
          onEditProject={p => setProjectModal({ isNew: false, data: p, clientId: p.clientId })}
          onDeleteProject={p => { if (window.confirm(`Delete project "${p.name}" and its tasks?`)) deleteProject(p.id) }}
        />
      )}

      {view === 'tasks' && (
        <TasksTable
          tasks={tasks}
          clients={clients}
          projects={projects}
          team={team}
          onToggleTask={toggleTask}
          onAddTask={() => setTaskModal({ isNew: true, data: null })}
          onEditTask={t => setTaskModal({ isNew: false, data: t })}
          onDeleteTask={id => { if (window.confirm('Delete this task?')) deleteTask(id) }}
          onDeleteTasks={ids => { if (window.confirm(`Delete ${ids.length} task(s)?`)) deleteTasks(ids) }}
        />
      )}

      {view === 'chase' && (
        <ChaseQueue
          tasks={tasks}
          clients={clients}
          onSnooze={snoozeChase}
          onDraftChase={draftChase}
          onDeleteTask={id => { if (window.confirm('Remove this from the chase queue? This deletes the task.')) deleteTask(id) }}
        />
      )}

      {view === 'kanban' && activeClient && (
        <KanbanBoard
          client={activeClient}
          projects={projects}
          tasks={tasks}
          team={team}
          initialProjectId={activeProjectId}
          onMoveTask={moveTask}
          onAddTask={(clientId, projectId) => setTaskModal({ isNew: true, data: null, fixedClientId: clientId, fixedProjectId: projectId })}
          onEditTask={t => setTaskModal({ isNew: false, data: t })}
          onDeleteTask={id => { if (window.confirm('Delete this task?')) deleteTask(id) }}
        />
      )}

      {view === 'add-client' && (
        <AddClientWizard team={team} onCreate={createClientFromWizard} onCancel={() => navigate('home')} />
      )}

      {view === 'checkin' && activeClient && (
        <CheckIn client={activeClient} team={team} tasks={tasks} currentUser={currentUser} checkin={activeCheckIn} onSave={saveCheckIn} onSendToClient={() => navigate('checkins')} />
      )}

      {view === 'checkins' && (
        <CheckinsHub
          clients={clients}
          checkins={checkins}
          onOpenCheckIn={openCheckIn}
          onDeleteCheckIn={id => { if (window.confirm('Delete this check-in?')) deleteCheckIn(id) }}
          onDeleteCheckIns={ids => { if (window.confirm(`Delete ${ids.length} check-in(s)?`)) deleteCheckIns(ids) }}
        />
      )}

      <AiDrawer
        open={aiDrawer.open}
        client={clients.find(c => c.id === aiDrawer.clientId) || null}
        tasks={tasks}
        initialPrompt={aiDrawer.initialPrompt}
        nonce={aiDrawer.nonce}
        onClose={closeAiDrawer}
      />

      {clientModal && (
        <EditClientModal
          client={clientModal.data}
          isNew={clientModal.isNew}
          team={team}
          onSave={saveClient}
          onClose={() => setClientModal(null)}
        />
      )}

      {teamModal && (
        <EditTeamMemberModal
          member={teamModal.data}
          isNew={teamModal.isNew}
          viewerIsAdmin={isAdmin}
          onSave={saveTeamMember}
          onClose={() => setTeamModal(null)}
        />
      )}

      {projectModal && (
        <EditProjectModal
          project={projectModal.data}
          isNew={projectModal.isNew}
          team={team}
          onSave={fields => {
            if (projectModal.isNew) addProject(projectModal.clientId, fields)
            else updateProject(projectModal.data.id, fields)
          }}
          onClose={() => setProjectModal(null)}
        />
      )}

      {taskModal && (
        <EditTaskModal
          task={taskModal.data}
          isNew={taskModal.isNew}
          clients={clients}
          projects={projects}
          team={team}
          fixedClientId={taskModal.fixedClientId}
          fixedProjectId={taskModal.fixedProjectId}
          onSave={fields => {
            if (taskModal.isNew) addTask(fields)
            else updateTask(taskModal.data.id, fields)
          }}
          onClose={() => setTaskModal(null)}
        />
      )}
    </div>
  )
}
