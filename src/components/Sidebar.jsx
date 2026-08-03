import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { COLORS, FONT_MONO } from '../theme.js'
import { Avatar, EditDeleteIcons } from './ui.jsx'

const NAV_ITEMS = [
  { key: 'home', label: 'Home' },
  { key: 'tasks', label: 'My tasks', countKey: 'mine' },
  { key: 'chase', label: 'Waiting on client', countKey: 'waiting' },
  { key: 'checkins', label: 'Check-ins' },
]

export default function Sidebar({
  view, onNavigate, clients, activeClientId, counts, team, currentUser, saveStatus, syncError, onDismissSyncError, onLogout,
  onEditTeamMember, onDeleteTeamMember,
}) {
  const [copied, setCopied] = useState(false)
  function inviteTeammate() {
    navigator.clipboard?.writeText(window.location.origin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <aside style={{
      background: COLORS.navy, color: '#EAF0F8', padding: '20px 16px',
      display: 'flex', flexDirection: 'column', gap: 26, width: 212, flexShrink: 0,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }} onClick={() => onNavigate('home')}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: COLORS.orange }} />
          <span style={{ font: '600 14px "Instrument Sans",sans-serif', letterSpacing: '-.01em' }}>Agency OS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 10.5, color: '#8FA3C0' }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: saveStatus === 'error' ? '#F87171' : saveStatus === 'saving' ? '#FCAF17' : '#4ADE80',
          }} />
          {saveStatus === 'error' ? 'Save failed' : saveStatus === 'saving' ? 'Saving…' : 'Saved'}
        </div>
      </div>

      {syncError && (
        <div style={{ background: 'rgba(248,113,113,.15)', border: '1px solid rgba(248,113,113,.4)', borderRadius: 8, padding: '9px 11px', fontSize: 11.5, color: '#FCA5A5', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div>{syncError}</div>
          <span onClick={onDismissSyncError} style={{ alignSelf: 'flex-start', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Dismiss</span>
        </div>
      )}

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 13 }}>
        {NAV_ITEMS.map(item => {
          const active = view === item.key
          const count = item.countKey ? counts[item.countKey] : null
          return (
            <div key={item.key} onClick={() => onNavigate(item.key)} style={{
              padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
              background: active ? 'rgba(255,255,255,.10)' : 'transparent',
              color: active ? '#fff' : '#9FB2CC', fontWeight: active ? 600 : 400,
              display: 'flex', justifyContent: 'space-between',
            }}>
              {item.label}
              {count != null && count > 0 && (
                <span style={{ color: item.key === 'chase' ? '#B8790A' : COLORS.orange, fontWeight: 600 }}>{count}</span>
              )}
            </div>
          )
        })}
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.09em', color: '#5A6A82' }}>CLIENTS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12.5, color: '#C3D0E2' }}>
          {clients.map(c => {
            const active = view === 'client' && activeClientId === c.id
            return (
              <div key={c.id} onClick={() => onNavigate('client', c.id)} style={{
                padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                background: active ? 'rgba(255,255,255,.10)' : 'transparent',
                color: active ? '#fff' : '#C3D0E2', fontWeight: active ? 600 : 400,
              }}>
                {c.name}
              </div>
            )
          })}
          {clients.length === 0 && <div style={{ padding: '6px 10px', fontSize: 11.5, color: '#8FA3C0', fontStyle: 'italic' }}>No clients yet</div>}
          <div onClick={() => onNavigate('add-client')} style={{ padding: '6px 10px', borderRadius: 6, cursor: 'pointer', color: '#8FA3C0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1px dashed rgba(255,255,255,.35)', display: 'grid', placeItems: 'center', fontSize: 11 }}>+</span>
            New client
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.09em', color: '#8FA3C0' }}>TEAM</div>
          {currentUser && (
            <span onClick={() => onEditTeamMember(currentUser)} style={{ fontSize: 10.5, color: COLORS.orange, cursor: 'pointer', fontWeight: 600 }}>
              Edit my profile
            </span>
          )}
        </div>
        {team.map(m => {
          const isSelf = currentUser?.id === m.id
          const canEdit = isSelf || currentUser?.isAdmin
          const canDelete = !isSelf && currentUser?.isAdmin
          return (
            <div key={m.id} className="team-row" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#EAF0F8' }}>
              <Avatar name={m.name} initials={m.initials} team={team} size={24} />
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.name} <span style={{ color: '#8FA3C0', fontSize: 11 }}>· {m.role}</span>
                {m.isAdmin && <span style={{ color: COLORS.orange, fontSize: 10.5, fontWeight: 600 }}> · admin</span>}
                {isSelf && <span style={{ color: COLORS.orange, fontSize: 10.5, fontWeight: 600 }}> · you</span>}
              </span>
              <EditDeleteIcons
                light
                onEdit={canEdit ? () => onEditTeamMember(m) : undefined}
                onDelete={canDelete ? () => onDeleteTeamMember(m) : undefined}
                deleteTitle="Remove teammate"
              />
            </div>
          )
        })}
        {team.length === 0 && <div style={{ fontSize: 11.5, color: '#8FA3C0', fontStyle: 'italic' }}>No teammates yet</div>}
        <div onClick={inviteTeammate} title="Copy the app link to invite them" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8FA3C0', cursor: 'pointer' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1px dashed rgba(255,255,255,.28)', display: 'grid', placeItems: 'center' }}>
            <UserPlus size={13} />
          </div>
          {copied ? 'Link copied!' : 'Invite teammate'}
        </div>
        <div onClick={onLogout} style={{ fontSize: 11.5, color: '#8FA3C0', cursor: 'pointer', marginTop: 4 }}>
          Sign out
        </div>
      </div>
    </aside>
  )
}
