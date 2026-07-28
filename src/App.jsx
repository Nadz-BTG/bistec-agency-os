import { useEffect, useRef, useState } from 'react'
import { CLIENTS, PROJECTS, TASKS, CHECKINS, TEAM } from './data.js'
import { dueLabelFor, overdueDaysFor, waitingDaysFor } from './dates.js'
import Login from './components/Login.jsx'
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

const STORAGE_KEY = 'agency-os-state-v2'
const USER_KEY = 'agency-os-user-v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore corrupt storage */ }
  return { clients: CLIENTS, projects: PROJECTS, tasks: TASKS, checkins: CHECKINS, team: TEAM }
}

function loadCurrentUserId() {
  try { return localStorage.getItem(USER_KEY) || null } catch { return null }
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [currentUserId, setCurrentUserId] = useState(loadCurrentUserId)
  const [saveStatus, setSaveStatus] = useState('saved')
  const [view, setView] = useState('home')
  const [activeClientId, setActiveClientId] = useState(null)
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [aiDrawer, setAiDrawer] = useState({ open: false, clientId: null, initialPrompt: '', nonce: 0 })

  const [clientModal, setClientModal] = useState(null) // { isNew, data }
  const [teamModal, setTeamModal] = useState(null)
  const [projectModal, setProjectModal] = useState(null) // { isNew, data, clientId }
  const [taskModal, setTaskModal] = useState(null) // { isNew, data, fixedClientId, fixedProjectId }

  const saveTimeout = useRef(null)
  const skipFirstSave = useRef(true)
  useEffect(() => {
    if (skipFirstSave.current) { skipFirstSave.current = false; return }
    setSaveStatus('saving')
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* storage unavailable */ }
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => setSaveStatus('saved'), 500)
    return () => clearTimeout(saveTimeout.current)
  }, [state])

  useEffect(() => {
    try {
      if (currentUserId) localStorage.setItem(USER_KEY, currentUserId)
      else localStorage.removeItem(USER_KEY)
    } catch { /* storage unavailable */ }
  }, [currentUserId])

  const { clients, projects, checkins, team } = state
  const tasks = state.tasks.map(t => ({
    ...t,
    due: dueLabelFor(t),
    overdueDays: overdueDaysFor(t),
    waitingDays: waitingDaysFor(t),
  }))
  const activeClient = clients.find(c => c.id === activeClientId) || null
  const currentUser = team.find(m => m.id === currentUserId) || null

  const counts = {
    mine: tasks.filter(t => t.status === 'open' && t.ownerType === 'team' && t.owner === currentUserId).length,
    waiting: tasks.filter(t => t.waitingDays != null && !t.snoozed).length,
  }

  function navigate(nextView, clientId) {
    setView(nextView)
    if (clientId) setActiveClientId(clientId)
  }

  function openClient(id) { navigate('client', id) }

  function openKanban(clientId, projectId) {
    setActiveProjectId(projectId)
    navigate('kanban', clientId)
  }

  function openCheckIn(clientId) { navigate('checkin', clientId) }

  function openAiDrawer(clientId, initialPrompt = '') {
    setAiDrawer(d => ({ open: true, clientId, initialPrompt, nonce: d.nonce + 1 }))
  }
  function closeAiDrawer() { setAiDrawer(d => ({ ...d, open: false })) }

  // ---- tasks ----
  function toggleTask(id) {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === id
        ? { ...t, done: !t.done, status: !t.done ? 'done' : 'open' }
        : t),
    }))
  }

  function addTask(draft) {
    setState(s => ({
      ...s,
      tasks: [...s.tasks, {
        id: `t-new-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        projectId: null, dueDate: null, askedDate: null, waitingOn: null, blocks: null,
        chasedCount: 0, cold: false, column: 'backlog', status: 'open', progress: null, note: null, done: false,
        ownerType: 'team', priority: 'Med', assignedBy: currentUserId,
        ...draft,
      }],
    }))
  }

  function updateTask(id, patch) {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => {
        if (t.id !== id) return t
        const reassigned = 'owner' in patch && patch.owner !== t.owner
        return { ...t, ...patch, ...(reassigned ? { assignedBy: currentUserId } : {}) }
      }),
    }))
  }

  function deleteTask(id) {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }))
  }

  function deleteTasks(ids) {
    const idSet = new Set(ids)
    setState(s => ({ ...s, tasks: s.tasks.filter(t => !idSet.has(t.id)) }))
  }

  function moveTask(id, column) {
    setState(s => ({ ...s, tasks: s.tasks.map(t => (t.id === id ? { ...t, column } : t)) }))
  }

  function snoozeChase(id) {
    setState(s => ({ ...s, tasks: s.tasks.map(t => (t.id === id ? { ...t, snoozed: true } : t)) }))
  }

  function draftChase(clientId, taskTitle) {
    openAiDrawer(clientId, `Draft a chase for: ${taskTitle}`)
  }

  // ---- clients ----
  function updateClient(id, patch) {
    setState(s => ({ ...s, clients: s.clients.map(c => (c.id === id ? { ...c, ...patch } : c)) }))
  }

  function saveClient(clientData) {
    setState(s => {
      const exists = s.clients.some(c => c.id === clientData.id)
      return { ...s, clients: exists ? s.clients.map(c => (c.id === clientData.id ? clientData : c)) : [...s.clients, clientData] }
    })
  }

  function deleteClient(id) {
    setState(s => ({
      ...s,
      clients: s.clients.filter(c => c.id !== id),
      projects: s.projects.filter(p => p.clientId !== id),
      tasks: s.tasks.filter(t => t.clientId !== id),
      checkins: s.checkins.filter(ci => ci.clientId !== id),
    }))
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
    if (activeClientId && idSet.has(activeClientId)) { setActiveClientId(null); navigate('home') }
  }

  function createClientFromWizard({ client, projects: newProjects, tasks: newTasks }) {
    setState(s => ({
      ...s,
      clients: [...s.clients, client],
      projects: [...s.projects, ...newProjects],
      tasks: [...s.tasks, ...newTasks.map((t, i) => ({
        id: `t-${client.id}-${i}-${Date.now()}`, dueDate: null, askedDate: null, waitingOn: null, blocks: null,
        chasedCount: 0, cold: false, status: 'open', progress: null, note: null, done: false, ownerType: 'team', ...t,
      }))],
    }))
    navigate('client', client.id)
  }

  // ---- projects ----
  function addProject(clientId, fields) {
    const id = `p-${clientId}-${Date.now()}-${Math.round(Math.random() * 1e6)}`
    setState(s => ({ ...s, projects: [...s.projects, { id, clientId, ...fields }] }))
  }

  function updateProject(id, patch) {
    setState(s => ({ ...s, projects: s.projects.map(p => (p.id === id ? { ...p, ...patch } : p)) }))
  }

  function deleteProject(id) {
    setState(s => ({ ...s, projects: s.projects.filter(p => p.id !== id), tasks: s.tasks.filter(t => t.projectId !== id) }))
  }

  // ---- check-ins ----
  function saveCheckIn(checkin) {
    setState(s => {
      const exists = s.checkins.some(c => c.id === checkin.id)
      return { ...s, checkins: exists ? s.checkins.map(c => (c.id === checkin.id ? checkin : c)) : [...s.checkins, checkin] }
    })
  }

  function deleteCheckIn(id) {
    setState(s => ({ ...s, checkins: s.checkins.filter(c => c.id !== id) }))
  }

  function deleteCheckIns(ids) {
    const idSet = new Set(ids)
    setState(s => ({ ...s, checkins: s.checkins.filter(c => !idSet.has(c.id)) }))
  }

  // ---- team ----
  function saveTeamMember(memberData) {
    setState(s => {
      const exists = s.team.some(m => m.id === memberData.id)
      return { ...s, team: exists ? s.team.map(m => (m.id === memberData.id ? memberData : m)) : [...s.team, memberData] }
    })
  }

  function deleteTeamMember(id) {
    setState(s => ({ ...s, team: s.team.filter(m => m.id !== id) }))
  }

  function logout() {
    setCurrentUserId(null)
  }

  // ---- files ----
  function addFilesToClient(clientId, newFiles) {
    setState(s => ({
      ...s,
      clients: s.clients.map(c => (c.id === clientId ? { ...c, files: [...(c.files || []), ...newFiles] } : c)),
    }))
  }

  function deleteFile(clientId, fileId) {
    setState(s => ({
      ...s,
      clients: s.clients.map(c => (c.id === clientId ? { ...c, files: (c.files || []).filter(f => f.id !== fileId) } : c)),
    }))
  }

  const activeCheckIn = activeClient
    ? [...checkins].reverse().find(c => c.clientId === activeClient.id && c.status === 'draft') || null
    : null

  if (!currentUser) {
    return (
      <Login
        team={team}
        onSelect={setCurrentUserId}
        onCreateAndSelect={m => { saveTeamMember(m); setCurrentUserId(m.id) }}
      />
    )
  }

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
        onLogout={logout}
        onAddTeamMember={() => setTeamModal({ isNew: true, data: null })}
        onEditTeamMember={m => setTeamModal({ isNew: false, data: m })}
        onDeleteTeamMember={m => {
          if (window.confirm(`Remove ${m.name} from the team?`)) deleteTeamMember(m.id)
        }}
      />

      {view === 'home' && (
        <Home
          clients={clients}
          tasks={tasks}
          currentUserName={currentUser.name}
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
          currentUser={currentUser}
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
