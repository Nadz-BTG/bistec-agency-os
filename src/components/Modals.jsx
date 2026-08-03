import { useState } from 'react'
import { COLORS, AVATAR_SWATCHES } from '../theme.js'
import { STAGES, PRIORITIES, PROJECT_STATUSES, OWNER_TYPES, TASK_COLUMNS, TEAM_ROLES } from '../constants.js'
import { todayISO } from '../dates.js'
import { Modal, Field, Button, TagListEditor, IconButton, inputStyle, textareaStyle, teamName } from './ui.jsx'
import { Trash2 } from 'lucide-react'

function pillStyle(active) {
  return {
    padding: '5px 10px', borderRadius: 20, fontSize: 11.5, cursor: 'pointer',
    background: active ? COLORS.navy : 'transparent', color: active ? '#fff' : COLORS.heading,
    border: `1px solid ${active ? COLORS.navy : COLORS.borderStrong}`, fontWeight: active ? 600 : 400,
  }
}

function slugify(name, fallbackPrefix) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24) || `${fallbackPrefix}${Date.now() % 100000}`
}

export function EditClientModal({ client, isNew, team, onSave, onClose }) {
  const [form, setForm] = useState(client || {
    name: '', tagline: '', stage: 'DISCOVERY', lead: team[0]?.id || '', started: todayISO(), nextCheckInDate: null,
    brief: '', positioning: '', icps: [], neverSay: [], contacts: [],
    narrative: { text: 'Workspace just created — nothing logged yet.', updatedAgo: 'just now' },
    stageProgress: ['current', 'empty', 'empty', 'empty', 'empty'],
  })
  function set(patch) { setForm(f => ({ ...f, ...patch })) }
  function updateContact(i, patch) {
    set({ contacts: form.contacts.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) })
  }
  function removeContact(i) {
    set({ contacts: form.contacts.filter((_, idx) => idx !== i) })
  }
  function addContact() {
    set({ contacts: [...form.contacts, { name: '', role: '' }] })
  }
  function save() {
    const id = form.id || slugify(form.name, 'client')
    onSave({ ...form, id, contacts: form.contacts.filter(c => c.name.trim()) })
    onClose()
  }

  return (
    <Modal title={isNew ? 'Add client' : `Edit ${client.name}`} onClose={onClose} width={560}>
      <Field label="Client name">
        <input style={inputStyle} value={form.name} onChange={e => set({ name: e.target.value })} autoFocus />
      </Field>
      <Field label="Engagement summary">
        <input style={inputStyle} value={form.tagline} onChange={e => set({ tagline: e.target.value })} placeholder="e.g. Strategy + LinkedIn build" />
      </Field>
      <Field label="Stage">
        <div style={{ display: 'flex', gap: 6 }}>
          {STAGES.map(s => (
            <span key={s} onClick={() => set({ stage: s.toUpperCase() })} style={pillStyle(form.stage === s.toUpperCase())}>{s}</span>
          ))}
        </div>
      </Field>
      <Field label="Account lead">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {team.map(m => (
            <span key={m.id} onClick={() => set({ lead: m.id })} style={pillStyle(form.lead === m.id)}>{m.name}</span>
          ))}
          {team.length === 0 && <span style={{ fontSize: 11.5, color: COLORS.textFaint, fontStyle: 'italic' }}>Add a teammate first</span>}
        </div>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Started"><input type="date" style={inputStyle} value={form.started || ''} max={todayISO()} onChange={e => set({ started: e.target.value })} /></Field>
        <Field label="Next check-in" hint="(optional)"><input type="date" style={inputStyle} value={form.nextCheckInDate || ''} onChange={e => set({ nextCheckInDate: e.target.value || null })} /></Field>
      </div>
      <Field label="Brief"><textarea rows={3} style={textareaStyle} value={form.brief} onChange={e => set({ brief: e.target.value })} /></Field>
      <Field label="Positioning"><textarea rows={2} style={textareaStyle} value={form.positioning} onChange={e => set({ positioning: e.target.value })} /></Field>
      <Field label="ICPs"><TagListEditor items={form.icps} onChange={icps => set({ icps })} /></Field>
      <Field label="Never say"><TagListEditor items={form.neverSay} onChange={neverSay => set({ neverSay })} tone="danger" /></Field>
      <Field label="Contacts">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {form.contacts.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={c.name} onChange={e => updateContact(i, { name: e.target.value })} placeholder="Name" />
              <input style={{ ...inputStyle, flex: 1 }} value={c.role} onChange={e => updateContact(i, { role: e.target.value })} placeholder="Role" />
              <IconButton icon={Trash2} tone="danger" onClick={() => removeContact(i)} title="Remove contact" />
            </div>
          ))}
          <Button variant="outline" onClick={addContact} style={{ alignSelf: 'flex-start', marginTop: 2 }}>+ Add contact</Button>
        </div>
      </Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="accent" onClick={save} disabled={!form.name.trim()}>{isNew ? 'Create client' : 'Save changes'}</Button>
      </div>
    </Modal>
  )
}

export function EditTeamMemberModal({ member, isNew, viewerIsAdmin, onSave, onClose }) {
  const [form, setForm] = useState(member || {
    name: '', initials: '', role: '', color: AVATAR_SWATCHES[0].color, textColor: AVATAR_SWATCHES[0].textColor,
  })
  const [useCustomRole, setUseCustomRole] = useState(!!form.role && !TEAM_ROLES.includes(form.role))
  function set(patch) { setForm(f => ({ ...f, ...patch })) }
  function save() {
    const initials = form.initials || form.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    const id = form.id || slugify(form.name, 'member')
    onSave({ ...form, id, initials })
    onClose()
  }
  return (
    <Modal title={isNew ? 'Add teammate' : 'Edit teammate'} onClose={onClose} width={400}>
      <Field label="Name"><input style={inputStyle} value={form.name} onChange={e => set({ name: e.target.value })} autoFocus /></Field>
      <Field label="Initials" hint="(auto if left blank)">
        <input style={inputStyle} value={form.initials} onChange={e => set({ initials: e.target.value.toUpperCase().slice(0, 2) })} maxLength={2} />
      </Field>
      <Field label="Role">
        <select style={inputStyle} value={useCustomRole ? '__custom__' : (form.role || '')} onChange={e => {
          if (e.target.value === '__custom__') { setUseCustomRole(true); set({ role: '' }) }
          else { setUseCustomRole(false); set({ role: e.target.value }) }
        }}>
          <option value="" disabled>Select a role…</option>
          {TEAM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          <option value="__custom__">Other…</option>
        </select>
        {useCustomRole && (
          <input style={{ ...inputStyle, marginTop: 6 }} value={form.role} onChange={e => set({ role: e.target.value })} placeholder="Custom role" autoFocus />
        )}
      </Field>
      <Field label="Colour">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {AVATAR_SWATCHES.map(sw => (
            <div key={sw.color} onClick={() => set({ color: sw.color, textColor: sw.textColor })} style={{
              width: 26, height: 26, borderRadius: '50%', background: sw.color, cursor: 'pointer',
              border: form.color === sw.color ? `2px solid ${COLORS.navy}` : '2px solid transparent',
            }} />
          ))}
        </div>
      </Field>
      {viewerIsAdmin && !isNew && (
        <Field label="Permissions">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: COLORS.text, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!form.isAdmin} onChange={e => set({ isAdmin: e.target.checked })} />
            Admin — can delete clients, edit or remove other teammates
          </label>
        </Field>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="accent" onClick={save} disabled={!form.name.trim()}>{isNew ? 'Add teammate' : 'Save changes'}</Button>
      </div>
    </Modal>
  )
}

export function EditProjectModal({ project, isNew, team, onSave, onClose }) {
  const [form, setForm] = useState(project || { name: '', owner: team[0]?.id || '', total: 1, done: 0, status: 'active', note: '' })
  function set(patch) { setForm(f => ({ ...f, ...patch })) }
  function save() {
    onSave({ ...form, total: Number(form.total) || 0, done: Number(form.done) || 0 })
    onClose()
  }
  return (
    <Modal title={isNew ? 'Add project' : 'Edit project'} onClose={onClose} width={420}>
      <Field label="Project name"><input style={inputStyle} value={form.name} onChange={e => set({ name: e.target.value })} autoFocus /></Field>
      <Field label="Assigned to">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {team.map(m => (
            <span key={m.id} onClick={() => set({ owner: m.id })} style={pillStyle(form.owner === m.id)}>{m.name}</span>
          ))}
          {team.length === 0 && <span style={{ fontSize: 11.5, color: COLORS.textFaint, fontStyle: 'italic' }}>Add a teammate first</span>}
        </div>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Tasks done"><input type="number" min={0} style={inputStyle} value={form.done} onChange={e => set({ done: e.target.value })} /></Field>
        <Field label="Tasks total"><input type="number" min={0} style={inputStyle} value={form.total} onChange={e => set({ total: e.target.value })} /></Field>
      </div>
      <Field label="Status">
        <div style={{ display: 'flex', gap: 6 }}>
          {PROJECT_STATUSES.map(s => (
            <span key={s} onClick={() => set({ status: s })} style={pillStyle(form.status === s)}>{s}</span>
          ))}
        </div>
      </Field>
      <Field label="Note" hint="(optional)"><input style={inputStyle} value={form.note || ''} onChange={e => set({ note: e.target.value })} placeholder="e.g. 2 overdue" /></Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="accent" onClick={save} disabled={!form.name.trim() || team.length === 0}>{isNew ? 'Add project' : 'Save changes'}</Button>
      </div>
    </Modal>
  )
}

const OTHER_CONTACT = '__other__'

export function EditTaskModal({ task, isNew, clients, projects, team, fixedClientId, fixedProjectId, onSave, onClose }) {
  const [form, setForm] = useState(task || {
    title: '', clientId: fixedClientId || clients[0]?.id || '', projectId: fixedProjectId || null,
    ownerType: 'team', owner: team[0]?.id || '', priority: 'Med', dueDate: null, column: 'backlog',
    askedDate: null, waitingOn: '', blocks: '', chasedCount: 0, cold: false, note: '',
  })
  function set(patch) { setForm(f => ({ ...f, ...patch })) }
  const selectedClient = clients.find(c => c.id === form.clientId)
  const clientContacts = selectedClient?.contacts || []
  const clientProjects = projects.filter(p => p.clientId === form.clientId)
  const isWaiting = !!form.askedDate
  const [useOtherContact, setUseOtherContact] = useState(
    !!form.waitingOn && !clientContacts.some(c => c.name === form.waitingOn)
  )

  function toggleWaiting(on) {
    if (on) {
      setUseOtherContact(false)
      set({ askedDate: todayISO(), waitingOn: form.waitingOn || clientContacts[0]?.name || '' })
    } else {
      set({ askedDate: null, waitingOn: '', blocks: '', chasedCount: 0, cold: false })
    }
  }

  function save() {
    onSave({
      ...form,
      waitingOn: isWaiting ? (form.waitingOn || null) : null,
      blocks: isWaiting ? (form.blocks || null) : null,
      chasedCount: isWaiting ? Number(form.chasedCount) || 0 : 0,
      cold: isWaiting ? !!form.cold : false,
      askedDate: isWaiting ? form.askedDate : null,
      note: form.note || null,
      projectId: form.projectId || null,
      dueDate: form.dueDate || null,
    })
    onClose()
  }

  return (
    <Modal title={isNew ? 'Add task' : 'Edit task'} onClose={onClose} width={500}>
      <Field label="Title"><input style={inputStyle} value={form.title} onChange={e => set({ title: e.target.value })} autoFocus /></Field>
      {!fixedClientId && (
        <Field label="Client">
          <select style={inputStyle} value={form.clientId} onChange={e => set({ clientId: e.target.value, projectId: null, waitingOn: '' })}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      )}
      <Field label="Project" hint="(optional)">
        <select style={inputStyle} value={form.projectId || ''} onChange={e => set({ projectId: e.target.value || null })}>
          <option value="">— none —</option>
          {clientProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Assigned to">
          <select style={inputStyle} value={form.ownerType} onChange={e => set({ ownerType: e.target.value, owner: e.target.value === 'team' ? (team[0]?.id || '') : '' })}>
            {OWNER_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Assignee">
          {form.ownerType === 'team' ? (
            <select style={inputStyle} value={form.owner} onChange={e => set({ owner: e.target.value })}>
              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              {team.length === 0 && <option value="">— no teammates —</option>}
            </select>
          ) : (
            <input style={inputStyle} value={form.owner} onChange={e => set({ owner: e.target.value })} placeholder="Name" />
          )}
        </Field>
      </div>
      {!isNew && task?.assignedBy && (
        <div style={{ margin: '-6px 0 12px', fontSize: 11, color: COLORS.textFaint, fontStyle: 'italic' }}>
          Assigned by {teamName(team, task.assignedBy)}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Priority">
          <select style={inputStyle} value={form.priority} onChange={e => set({ priority: e.target.value })}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Due date" hint="(optional)"><input type="date" style={inputStyle} value={form.dueDate || ''} onChange={e => set({ dueDate: e.target.value || null })} /></Field>
        <Field label="Board column">
          <select style={inputStyle} value={form.column} onChange={e => set({ column: e.target.value })}>
            {TASK_COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Waiting on a client reply?">
        <div style={{ display: 'flex', gap: 6 }}>
          <span onClick={() => toggleWaiting(true)} style={pillStyle(isWaiting)}>Yes</span>
          <span onClick={() => toggleWaiting(false)} style={pillStyle(!isWaiting)}>No</span>
        </div>
      </Field>

      {isWaiting && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Asked on"><input type="date" style={inputStyle} value={form.askedDate || ''} max={todayISO()} onChange={e => set({ askedDate: e.target.value })} /></Field>
            <Field label="Times chased"><input type="number" min={0} style={inputStyle} value={form.chasedCount || 0} onChange={e => set({ chasedCount: e.target.value })} /></Field>
          </div>
          <Field label="Waiting on">
            {clientContacts.length > 0 ? (
              <>
                <select style={inputStyle} value={useOtherContact ? OTHER_CONTACT : form.waitingOn} onChange={e => {
                  if (e.target.value === OTHER_CONTACT) { setUseOtherContact(true); set({ waitingOn: '' }) }
                  else { setUseOtherContact(false); set({ waitingOn: e.target.value }) }
                }}>
                  {clientContacts.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  <option value={OTHER_CONTACT}>Someone else…</option>
                </select>
                {useOtherContact && (
                  <input style={{ ...inputStyle, marginTop: 6 }} value={form.waitingOn} onChange={e => set({ waitingOn: e.target.value })} placeholder="Name" autoFocus />
                )}
              </>
            ) : (
              <input style={inputStyle} value={form.waitingOn} onChange={e => set({ waitingOn: e.target.value })} placeholder="Contact name" />
            )}
          </Field>
          <Field label="Blocks" hint="(optional)"><input style={inputStyle} value={form.blocks || ''} onChange={e => set({ blocks: e.target.value })} placeholder="e.g. blocks 4 tasks" /></Field>
          <Field>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: COLORS.text, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!form.cold} onChange={e => set({ cold: e.target.checked })} />
              Flag as gone cold
            </label>
          </Field>
        </>
      )}

      <Field label="Note" hint="(optional)"><input style={inputStyle} value={form.note || ''} onChange={e => set({ note: e.target.value })} placeholder="e.g. Claude draft ready" /></Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="accent" onClick={save} disabled={!form.title.trim()}>{isNew ? 'Add task' : 'Save changes'}</Button>
      </div>
    </Modal>
  )
}
