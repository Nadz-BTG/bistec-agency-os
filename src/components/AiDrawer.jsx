import { useEffect, useRef, useState } from 'react'
import { COLORS, FONT_MONO } from '../theme.js'

const SHORTCUTS = ['LinkedIn post', 'Chase email', 'Next actions', 'Check-in summary']

function buildReply(promptRaw, client, tasks) {
  const prompt = promptRaw.toLowerCase()
  const clientTasks = tasks.filter(t => t.clientId === client.id)
  const overdue = clientTasks.filter(t => t.overdueDays).sort((a, b) => b.overdueDays - a.overdueDays)
  const waiting = clientTasks.filter(t => t.waitingDays != null).sort((a, b) => b.waitingDays - a.waitingDays)
  const open = clientTasks.filter(t => t.status === 'open')

  if (prompt.includes('risk')) {
    if (!waiting.length && !overdue.length) {
      return [`Nothing at risk this week. ${client.name} is on track — ${client.narrative.text}`]
    }
    const parts = []
    if (waiting.length) parts.push(`**${waiting[0].title}** has been sitting with ${waiting[0].waitingOn} for ${waiting[0].waitingDays} days${waiting[0].blocks ? ` — ${waiting[0].blocks}` : ''}.`)
    if (overdue.length) parts.push(`**${overdue[0].title}** is ${overdue[0].overdueDays} days past due.`)
    parts.push('Want me to write one email covering both, or turn these into tracked tasks?')
    return parts
  }

  if (prompt.includes('chase') || prompt.includes('bundle')) {
    if (!waiting.length) return [`Nothing is waiting on a client contact for ${client.name} right now.`]
    const lines = waiting.map(w => `— ${w.title} (asked of ${w.waitingOn}, ${w.waitingDays} days ago)`)
    return [
      `Here's a draft chase for ${client.name}:`,
      `Subject: Quick nudge on a couple of open items\n\nHi ${waiting[0].waitingOn.split(' ')[0]},\n\nHope you're well — following up on a couple of things that are still open on our side:\n\n${lines.join('\n')}\n\nHappy to jump on a quick call if that's easier. Thanks!`,
    ]
  }

  if (prompt.includes('next action')) {
    if (!open.length) return [`${client.name} has no open tasks right now — nice and clear.`]
    const lines = open.slice(0, 5).map(t => `— ${t.title}${t.due ? ` (${t.due})` : ''}`)
    return [`Top things to move next for ${client.name}:`, lines.join('\n')]
  }

  if (prompt.includes('check-in') || prompt.includes('summary')) {
    return [client.narrative.text, 'Want this dropped straight into a check-in draft?']
  }

  if (prompt.includes('linkedin post')) {
    const icp = client.icps[0] || 'their ICP'
    return [
      `Using "${client.positioning}" and the ${icp} angle:`,
      `"Everyone in ${icp.toLowerCase()} thinks the problem is technical. It isn't — it's operational. Here's what actually moves the needle…"`,
      '— roughly 150 words, one concrete example, no emoji. Want it shorter or punchier?',
    ]
  }

  return [client.narrative.text, `Want me to draft a chase, suggest next actions, or summarise this for the ${client.nextCheckIn} check-in?`]
}

export default function AiDrawer({ open, client, tasks, initialPrompt, nonce, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const seenClientRef = useRef(null)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (!open || !client) return
    if (seenClientRef.current !== client.id) {
      seenClientRef.current = client.id
      setMessages([])
    }
    if (initialPrompt) {
      send(initialPrompt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client?.id, nonce])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages])

  function send(text) {
    const t = text.trim()
    if (!t || !client) return
    const reply = buildReply(t, client, tasks)
    setMessages(m => [...m, { role: 'user', text: t }, { role: 'assistant', text: reply }])
    setInput('')
  }

  if (!open || !client) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(20,55,125,.34)' }} />
      <div style={{
        position: 'relative', width: 'min(470px, 100vw)', background: '#fff', borderLeft: `1px solid ${COLORS.borderStrong}`,
        display: 'flex', flexDirection: 'column', boxShadow: '-12px 0 40px rgba(20,55,125,.18)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ font: '600 13.5px "Instrument Sans",sans-serif' }}>Claude</div>
            <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 2 }}>Working on {client.name}</div>
          </div>
          <div onClick={onClose} style={{ fontSize: 16, color: COLORS.textFaint, cursor: 'pointer' }}>✕</div>
        </div>

        <div style={{ padding: '12px 20px', background: '#F7FAFD', borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.08em', color: COLORS.textFaint, marginBottom: 7 }}>CONTEXT LOADED</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {['Client brief', 'Positioning', `${client.icps.length} ICPs`, `${tasks.filter(t => t.clientId === client.id).length} open tasks`].map(chip => (
              <span key={chip} style={{ padding: '4px 9px', borderRadius: 6, background: '#fff', border: `1px solid ${COLORS.borderStrong}`, fontSize: 11.5 }}>{chip}</span>
            ))}
          </div>
        </div>

        <div ref={bodyRef} style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          {messages.length === 0 && (
            <div style={{ fontSize: 13, color: COLORS.textFaint }}>Ask about {client.name}, or start with a shortcut below.</div>
          )}
          {messages.map((m, i) => m.role === 'user' ? (
            <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '85%', padding: '10px 13px', borderRadius: '11px 11px 3px 11px', background: COLORS.navy, color: '#EAF0F8', fontSize: 13, lineHeight: 1.5 }}>
              {m.text}
            </div>
          ) : (
            <div key={i} style={{ maxWidth: '92%', fontSize: 13.5, lineHeight: 1.65, color: '#1B2A43' }}>
              {m.text.map((para, j) => (
                <p key={j} style={{ margin: j === 0 ? '0 0 10px' : '0 0 10px', whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 20px', borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ padding: '11px 13px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 9, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(input) }}
              placeholder="Ask, or start with a draft…"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: COLORS.heading, background: 'transparent' }}
            />
            <span onClick={() => send(input)} style={{ padding: '4px 8px', borderRadius: 6, background: COLORS.navy, color: '#fff', fontSize: 11, cursor: 'pointer' }}>↵</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 9, fontSize: 11.5, color: COLORS.textFaint, flexWrap: 'wrap' }}>
            {SHORTCUTS.map((s, i) => (
              <span key={s} onClick={() => send(s)} style={{ cursor: 'pointer' }}>
                {s}{i < SHORTCUTS.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
