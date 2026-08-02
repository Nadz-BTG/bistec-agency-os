import { useState } from 'react'
import { COLORS } from '../theme.js'
import { Button, inputStyle } from './ui.jsx'
import { supabase } from '../supabaseClient.js'

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    const { error: err } = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (err) { setError(err.message); return }
    if (mode === 'signup') setNotice('Account created — check your email to confirm, then sign in.')
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.page }}>
      <form onSubmit={submit} style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 18, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: COLORS.orange }} />
          <span style={{ font: '600 18px "Instrument Sans",sans-serif', color: COLORS.heading }}>Agency OS</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, font: "400 28px 'Instrument Serif',serif", color: COLORS.heading }}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: COLORS.textMuted }}>Shared workspace for the whole team — sign in from any device.</p>
        </div>
        <label style={{ fontSize: 12, color: COLORS.textFaint }}>Email
          <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, marginTop: 5 }} placeholder="you@bistecglobal.com" />
        </label>
        <label style={{ fontSize: 12, color: COLORS.textFaint }}>Password
          <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginTop: 5 }} placeholder="At least 6 characters" />
        </label>
        {error && <div style={{ padding: '9px 12px', borderRadius: 7, background: '#FDE7D3', color: COLORS.orangeDark, fontSize: 12.5 }}>{error}</div>}
        {notice && <div style={{ padding: '9px 12px', borderRadius: 7, background: '#DCEBF7', color: COLORS.blueDark, fontSize: 12.5 }}>{notice}</div>}
        <Button type="submit" variant="accent" disabled={busy || !email || password.length < 6}>
          {busy ? 'One sec…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
        <p style={{ margin: 0, fontSize: 12.5, color: COLORS.textMuted, textAlign: 'center' }}>
          {mode === 'signin' ? "New teammate? " : 'Already have an account? '}
          <span onClick={() => { setMode(m => (m === 'signin' ? 'signup' : 'signin')); setError(''); setNotice('') }} style={{ color: COLORS.orange, cursor: 'pointer', fontWeight: 600 }}>
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </span>
        </p>
      </form>
    </div>
  )
}
