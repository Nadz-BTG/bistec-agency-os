import { useState } from 'react'
import { COLORS } from '../theme.js'
import { AVATAR_SWATCHES } from '../theme.js'
import { Modal, Field, Button, TagListEditor, IconButton, inputStyle, textareaStyle } from './ui.jsx'
import { Trash2 } from 'lucide-react'

const STAGES = ['Discovery', 'Strategy', 'Delivery', 'Ongoing']

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
    name: '', tagline: '', stage: 'DISCOVERY', lead: team[0]?.id || '', started: '', nextCheckIn: 'TBC',
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
        <Field label="Started"><input style={inputStyle} value={form.started || ''} onChange={e => set({ started: e.target.value })} /></Field>
        <Field label="Next check-in"><input style={inputStyle} value={form.nextCheckIn || ''} onChange={e => set({ nextCheckIn: e.target.value })} /></Field>
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

export function EditTeamMemberModal({ member, isNew, onSave, onClose }) {
  const [form, setForm] = useState(member || {
    name: '', initials: '', role: '', color: AVATAR_SWATCHES[0].color, textColor: AVATAR_SWATCHES[0].textColor,
  })
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
      <Field label="Role"><input style={inputStyle} value={form.role} onChange={e => set({ role: e.target.value })} placeholder="e.g. account lead" /></Field>
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
      <Field label="Owner">
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
          {['active', 'blocked', 'done'].map(s => (
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

export function EditTaskModal({ task, isNew, clients, projects, team, fixedClientId, fixedProjectId, onSave, onClose }) {
  const [form, setForm] = useState(task || {
    title: '', clientId: fixedClientId || clients[0]?.id || '', projectId: fixedProjectId || null,
    ownerType: 'team', owner: team[0]?.id || '', priority: 'Med', due: '', column: 'backlog',
    waitingDays: '', waitingOn: '', blocks: '', note: '',
  })
  function set(patch) { setForm(f => ({ ...f, ...patch })) }
  const clientProjects = projects.filter(p => p.clientId === form.clientId)
  function save() {
    onSave({
      ...form,
      waitingDays: form.waitingDays === '' || form.waitingDays == null ? null : Number(form.waitingDays),
      waitingOn: form.waitingOn || null,
      blocks: form.blocks || null,
      note: form.note || null,
      projectId: form.projectId || null,
    })
    onClose()
  }
  return (
    <Modal title={isNew ? 'Add task' : 'Edit task'} onClose={onClose} width={500}>
      <Field label="Title"><input style={inputStyle} value={form.title} onChange={e => set({ title: e.target.value })} autoFocus /></Field>
      {!fixedClientId && (
        <Field label="Client">
          <select style={inputStyle} value={form.clientId} onChange={e => set({ clientId: e.target.value, projectId: null })}>
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
        <Field label="Owner type">
          <select style={inputStyle} value={form.ownerType} onChange={e => set({ ownerType: e.target.value, owner: e.target.value === 'team' ? (team[0]?.id || '') : '' })}>
            <option value="team">Team</option>
            <option value="client">Client contact</option>
            <option value="external">External</option>
          </select>
        </Field>
        <Field label="Owner">
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Priority">
          <select style={inputStyle} value={form.priority} onChange={e => set({ priority: e.target.value })}>
            <option>High</option><option>Med</option><option>Low</option>
          </select>
        </Field>
        <Field label="Due" hint="(free text)"><input style={inputStyle} value={form.due || ''} onChange={e => set({ due: e.target.value })} placeholder="e.g. Fri" /></Field>
        <Field label="Board column">
          <select style={inputStyle} value={form.column} onChange={e => set({ column: e.target.value })}>
            <option value="backlog">Backlog</option>
            <option value="drafting">Drafting</option>
            <option value="with_client">With client</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
          </select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Waiting on" hint="(client contact, if any)"><input style={inputStyle} value={form.waitingOn || ''} onChange={e => set({ waitingOn: e.target.value })} /></Field>
        <Field label="Waiting days" hint="(if applicable)"><input type="number" min={0} style={inputStyle} value={form.waitingDays == null ? '' : form.waitingDays} onChange={e => set({ waitingDays: e.target.value })} /></Field>
      </div>
      <Field label="Blocks" hint="(optional)"><input style={inputStyle} value={form.blocks || ''} onChange={e => set({ blocks: e.target.value })} placeholder="e.g. blocks 4 tasks" /></Field>
      <Field label="Note" hint="(optional)"><input style={inputStyle} value={form.note || ''} onChange={e => set({ note: e.target.value })} placeholder="e.g. Claude draft ready" /></Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="accent" onClick={save} disabled={!form.title.trim()}>{isNew ? 'Add task' : 'Save changes'}</Button>
      </div>
    </Modal>
  )
}
