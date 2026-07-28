import { useEffect, useState } from 'react'
import { CLIENTS, PROJECTS, TASKS, CHECKINS } from './data.js'
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

const STORAGE_KEY = 'agency-os-state-v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore corrupt storage */ }
  return { clients: CLIENTS, projects: PROJECTS, tasks: TASKS, checkins: CHECKINS }
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [view, setView] = useState('home')
  const [activeClientId, setActiveClientId] = useState(null)
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [aiDrawer, setAiDrawer] = useState({ open: false, clientId: null, initialPrompt: '', nonce: 0 })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* storage unavailable */ }
  }, [state])

  const { clients, projects, tasks, checkins } = state
  const activeClient = clients.find(c => c.id === activeClientId) || null

  const counts = {
    mine: tasks.filter(t => t.status === 'open' && t.ownerType === 'team' && t.owner === 'nadha').length,
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

  function toggleTask(id) {
    setState(s => ({
      ...s,
      tasks: s.tasks.map(t => t.id === id
        ? { ...t, done: !t.done, status: !t.done ? 'done' : 'open' }
        : t),
    }))
  }

  function updateClient(id, patch) {
    setState(s => ({ ...s, clients: s.clients.map(c => c.id === id ? { ...c, ...patch } : c) }))
  }

  function addTask(draft) {
    setState(s => ({
      ...s,
      tasks: [...s.tasks, {
        id: `t-new-${Date.now()}`,
        projectId: null,
        overdueDays: null,
        waitingDays: null,
        waitingOn: null,
        blocks: null,
        chasedCount: 0,
        cold: false,
        column: 'backlog',
        status: 'open',
        progress: null,
        note: null,
        done: false,
        ownerType: 'team',
        priority: 'Med',
        due: '',
        ...draft,
      }],
    }))
  }

  function moveTask(id, column) {
    setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, column } : t) }))
  }

  function snoozeChase(id) {
    setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, snoozed: true } : t) }))
  }

  function draftChase(clientId, taskTitle) {
    openAiDrawer(clientId, `Draft a chase for: ${taskTitle}`)
  }

  function saveCheckIn(checkin) {
    setState(s => {
      const exists = s.checkins.some(c => c.id === checkin.id)
      return { ...s, checkins: exists ? s.checkins.map(c => c.id === checkin.id ? checkin : c) : [...s.checkins, checkin] }
    })
  }

  function createClient({ client, projects: newProjects, tasks: newTasks }) {
    setState(s => ({
      ...s,
      clients: [...s.clients, client],
      projects: [...s.projects, ...newProjects],
      tasks: [...s.tasks, ...newTasks.map((t, i) => ({
        id: `t-${client.id}-${i}`, overdueDays: null, waitingDays: null, waitingOn: null, blocks: null,
        chasedCount: 0, cold: false, status: 'open', progress: null, note: null, done: false, ownerType: 'team', ...t,
      }))],
    }))
    navigate('client', client.id)
  }

  const activeCheckIn = activeClient
    ? [...checkins].reverse().find(c => c.clientId === activeClient.id && c.status === 'draft') || null
    : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} onNavigate={navigate} clients={clients} activeClientId={activeClientId} counts={counts} />

      {view === 'home' && (
        <Home clients={clients} tasks={tasks} currentUserName="Nadha" onOpenClient={openClient} onNavigate={navigate} />
      )}

      {view === 'client' && activeClient && (
        <ClientWorkspace
          client={activeClient}
          tasks={tasks}
          projects={projects}
          checkins={checkins}
          onUpdateClient={updateClient}
          onToggleTask={toggleTask}
          onOpenAiDrawer={openAiDrawer}
          onOpenKanban={openKanban}
          onOpenCheckIn={openCheckIn}
        />
      )}

      {view === 'tasks' && (
        <TasksTable tasks={tasks} clients={clients} projects={projects} onToggleTask={toggleTask} onAddTask={addTask} />
      )}

      {view === 'chase' && (
        <ChaseQueue tasks={tasks} clients={clients} onSnooze={snoozeChase} onDraftChase={draftChase} />
      )}

      {view === 'kanban' && activeClient && (
        <KanbanBoard client={activeClient} projects={projects} tasks={tasks} initialProjectId={activeProjectId} onMoveTask={moveTask} onAddTask={addTask} />
      )}

      {view === 'add-client' && (
        <AddClientWizard onCreate={createClient} onCancel={() => navigate('home')} />
      )}

      {view === 'checkin' && activeClient && (
        <CheckIn client={activeClient} checkin={activeCheckIn} onSave={saveCheckIn} onSendToClient={() => navigate('checkins')} />
      )}

      {view === 'checkins' && (
        <CheckinsHub clients={clients} checkins={checkins} onOpenCheckIn={openCheckIn} />
      )}

      <AiDrawer
        open={aiDrawer.open}
        client={clients.find(c => c.id === aiDrawer.clientId) || null}
        tasks={tasks}
        initialPrompt={aiDrawer.initialPrompt}
        nonce={aiDrawer.nonce}
        onClose={closeAiDrawer}
      />
    </div>
  )
}
