import { COLORS, FONT_MONO } from '../theme.js'
import { Button, IconButton } from './ui.jsx'
import { Trash2 } from 'lucide-react'

function ageColor(days, cold) {
  if (cold || days >= 14) return COLORS.orange
  if (days >= 7) return COLORS.amber
  return '#DDE3EC'
}

export default function ChaseQueue({ tasks, clients, onSnooze, onDraftChase, onDeleteTask }) {
  const clientName = id => clients.find(c => c.id === id)?.name || id
  const items = tasks
    .filter(t => t.waitingDays != null && !t.snoozed)
    .sort((a, b) => b.waitingDays - a.waitingDays)

  const byClient = {}
  items.forEach(t => { byClient[t.clientId] = (byClient[t.clientId] || 0) + 1 })
  const bundleClientId = Object.entries(byClient).sort((a, b) => b[1] - a[1])[0]?.[0]
  const bundleCount = bundleClientId ? byClient[bundleClientId] : 0

  return (
    <main style={{ background: COLORS.page, color: COLORS.heading, minHeight: '100%', padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 18, flex: 1, minWidth: 0, maxWidth: 900 }}>
      <div>
        <h1 style={{ margin: 0, font: "400 32px/1 'Instrument Serif',serif" }}>Waiting on client</h1>
        <p style={{ margin: '7px 0 0', fontSize: 13, color: COLORS.textMuted }}>
          {items.length} things sitting with clients. {items.filter(t => t.cold || t.waitingDays >= 14).length} have gone cold.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24, textAlign: 'center', color: COLORS.textFaint, fontSize: 13 }}>
            Nothing waiting on a client right now.
          </div>
        )}
        {items.map(t => {
          const color = ageColor(t.waitingDays, t.cold)
          const light = t.waitingDays < 7 && !t.cold
          return (
            <div key={t.id} style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden',
              display: 'grid', gridTemplateColumns: '78px 1fr auto', opacity: light ? 0.75 : 1,
            }}>
              <div style={{ background: color, color: light ? COLORS.textMuted : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
                <div style={{ font: "400 30px/1 'Instrument Serif',serif" }}>{t.waitingDays}</div>
                <div style={{ font: `500 9.5px ${FONT_MONO}`, letterSpacing: '.08em', marginTop: 3 }}>DAYS</div>
              </div>
              <div style={{ padding: '15px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.title} — {clientName(t.clientId)}</div>
                  <IconButton icon={Trash2} tone="danger" onClick={() => onDeleteTask(t.id)} title="Remove from queue" />
                </div>
                <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginTop: 4 }}>
                  {t.chasedCount > 0 ? `Chased ${t.chasedCount} time${t.chasedCount > 1 ? 's' : ''}` : 'Not chased yet'}
                  {t.blocks ? ` · ${t.blocks}` : ''}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
                  <span style={{ padding: '3px 8px', borderRadius: 5, background: '#EEF1F6', fontSize: 11 }}>{t.waitingOn}</span>
                  {(t.cold || t.waitingDays >= 14) && <span style={{ padding: '3px 8px', borderRadius: 5, background: '#FDE7D3', color: COLORS.orangeDark, fontSize: 11, fontWeight: 600 }}>gone cold</span>}
                  {!t.cold && t.waitingDays >= 7 && t.waitingDays < 14 && <span style={{ padding: '3px 8px', borderRadius: 5, background: '#FEF1D3', color: COLORS.amberDark, fontSize: 11, fontWeight: 600 }}>chase due</span>}
                </div>
              </div>
              <div style={{ padding: '15px 18px', display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                {light ? (
                  <div onClick={() => onSnooze(t.id)} style={{ padding: '7px 12px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 7, font: '500 12px "Instrument Sans",sans-serif', textAlign: 'center', cursor: 'pointer' }}>Leave it</div>
                ) : (
                  <>
                    <div onClick={() => onDraftChase(t.clientId, t.title)} style={{ padding: '7px 12px', borderRadius: 7, background: t.cold ? COLORS.orange : COLORS.navy, color: '#fff', font: '500 12px "Instrument Sans",sans-serif', textAlign: 'center', cursor: 'pointer' }}>Draft chase</div>
                    <div onClick={() => onSnooze(t.id)} style={{ padding: '7px 12px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 7, font: '500 12px "Instrument Sans",sans-serif', textAlign: 'center', cursor: 'pointer' }}>Snooze</div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {bundleCount >= 2 && (
        <div style={{ background: COLORS.navy, color: '#EAF0F8', borderRadius: 10, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ font: '600 13px "Instrument Sans",sans-serif' }}>One chase, {bundleCount} asks</div>
            <div style={{ fontSize: 12.5, color: '#9FB2CC', marginTop: 3 }}>
              Claude can bundle everything outstanding for {clientName(bundleClientId)} into a single email.
            </div>
          </div>
          <Button variant="accent" onClick={() => onDraftChase(bundleClientId, 'a bundled chase covering everything outstanding')}>Draft it</Button>
        </div>
      )}
    </main>
  )
}
