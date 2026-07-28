import { useState } from 'react'
import { COLORS } from '../theme.js'
import { Avatar, Button } from './ui.jsx'
import { EditTeamMemberModal } from './Modals.jsx'

export default function Login({ team, onSelect, onCreateAndSelect }) {
  const [adding, setAdding] = useState(false)

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.page }}>
      <div style={{ width: 420, display: 'flex', flexDirection: 'column', gap: 22, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: COLORS.orange }} />
          <span style={{ font: '600 18px "Instrument Sans",sans-serif', color: COLORS.heading }}>Agency OS</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, font: "400 28px 'Instrument Serif',serif", color: COLORS.heading }}>Who's working today?</h1>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: COLORS.textMuted }}>Pick your profile to continue — this browser will remember you.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {team.map(m => (
            <button key={m.id} onClick={() => onSelect(m.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff',
              border: `1px solid ${COLORS.border}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', font: 'inherit',
            }}>
              <Avatar name={m.name} initials={m.initials} team={team} size={34} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.heading }}>{m.name}</div>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint }}>{m.role}</div>
              </div>
            </button>
          ))}
          {team.length === 0 && (
            <div style={{ fontSize: 12.5, color: COLORS.textFaint, textAlign: 'center', fontStyle: 'italic' }}>No profiles yet — add the first one below.</div>
          )}
        </div>
        <Button variant="outline" onClick={() => setAdding(true)}>+ Add my profile</Button>
        <p style={{ margin: 0, fontSize: 11, color: COLORS.textFaint, textAlign: 'center' }}>
          This identifies you on this device only — it isn't a password.
        </p>
      </div>
      {adding && (
        <EditTeamMemberModal
          isNew
          member={null}
          onClose={() => setAdding(false)}
          onSave={m => onCreateAndSelect(m)}
        />
      )}
    </div>
  )
}
