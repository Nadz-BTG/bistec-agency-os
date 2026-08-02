import { useState } from 'react'
import { COLORS } from '../theme.js'
import { Button, inputStyle } from './ui.jsx'
import { supabase } from '../supabaseClient.js'

export default function UpdatePassword({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError("Passwords don't match."); return }
    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (err) { setError(err.message); return }
    onDone()
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.page }}>
      <form onSubmit={submit} style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 18, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: COLORS.orange }} />
          <span style={{ font: '600 18px "Instrument Sans",sans-serif', color: COLORS.heading }}>Agency OS</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, font: "400 28px 'Instrument Serif',serif", color: COLORS.heading }}>Set a new password</h1>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: COLORS.textMuted }}>You're signed in via the reset link — choose a new password to finish.</p>
        </div>
        <label style={{ fontSize: 12, color: COLORS.textFaint }}>New password
          <input type="password" required minLength={6} autoFocus value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginTop: 5 }} placeholder="At least 6 characters" />
        </label>
        <label style={{ fontSize: 12, color: COLORS.textFaint }}>Confirm password
          <input type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} style={{ ...inputStyle, marginTop: 5 }} placeholder="Type it again" />
        </label>
        {error && <div style={{ padding: '9px 12px', borderRadius: 7, background: '#FDE7D3', color: COLORS.orangeDark, fontSize: 12.5 }}>{error}</div>}
        <Button type="submit" variant="accent" disabled={busy || password.length < 6 || !confirm}>
          {busy ? 'One sec…' : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
