import { useState } from 'react'
import { COLORS } from '../theme.js'
import { STAGES } from '../constants.js'
import { todayISO } from '../dates.js'
import { Button } from './ui.jsx'

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24) || `client${Date.now() % 100000}`
}

function extractFromText(text) {
  const quoted = [...text.matchAll(/"([^"]+)"/g)].map(m => m[1])
  const positioning = quoted[0] || (text.split(/\.\s/)[0] || '').trim()
  let neverSay = []
  const neverSayMatch = text.match(/(?:never say|hates the phrase|avoid the phrase)[^"']*["']([^"']+)["']/i)
  if (neverSayMatch) neverSay = [neverSayMatch[1]]
  const icpMatches = [...text.matchAll(/([A-Z][a-z]+(?:[ -][A-Z]?[a-z]+){0,3}\s(?:director|manager|lead|CFO|CMO|CEO|coordinator))/g)].map(m => m[1])
  return { positioning, neverSay, icps: [...new Set(icpMatches)].slice(0, 3) }
}

export default function AddClientWizard({ team, onCreate, onCancel }) {
  const [step, setStep] = useState(1)
  const [basics, setBasics] = useState({ name: '', tagline: '', stage: 'Discovery', lead: team[0]?.id || '' })
  const [source, setSource] = useState('')
  const [read, setRead] = useState({ positioning: '', icps: [], neverSay: [] })
  const [icpInput, setIcpInput] = useState('')

  function extract() {
    setRead(extractFromText(source))
  }

  function addIcp() {
    if (!icpInput.trim()) return
    setRead(r => ({ ...r, icps: [...r.icps, icpInput.trim()] }))
    setIcpInput('')
  }

  function removeIcp(icp) {
    setRead(r => ({ ...r, icps: r.icps.filter(i => i !== icp) }))
  }

  function create() {
    const id = slug(basics.name)
    const client = {
      id,
      name: basics.name || 'New client',
      tagline: basics.tagline || 'New engagement',
      stage: basics.stage.toUpperCase(),
      lead: basics.lead,
      started: todayISO(),
      nextCheckInDate: null,
      brief: source || 'No brief captured yet.',
      icps: read.icps,
      positioning: read.positioning || 'Positioning draft pending.',
      neverSay: read.neverSay,
      contacts: [],
      narrative: { text: 'Workspace just created — nothing logged yet.', updatedAgo: 'just now' },
      stageProgress: ['current', 'empty', 'empty', 'empty', 'empty'],
    }
    const projects = [
      { id: `p-${id}-disc`, clientId: id, name: 'Discovery & positioning', owner: basics.lead, done: 0, total: 4, status: 'active', note: 'just started' },
      { id: `p-${id}-content`, clientId: id, name: 'Content programme', owner: basics.lead, done: 0, total: 3, status: 'active', note: 'starts after sign-off' },
    ]
    const starterTasks = [
      { title: 'Confirm ICPs', projectId: projects[0].id },
      { title: 'Draft positioning statement', projectId: projects[0].id },
      { title: 'Book kickoff call', projectId: projects[0].id },
      { title: 'Content calendar v1', projectId: projects[1].id },
    ]
    const tasks = starterTasks.map(st => ({
      title: st.title, clientId: id, projectId: st.projectId, owner: basics.lead, priority: 'Med', due: '', column: 'backlog',
    }))
    onCreate({ client, projects, tasks })
  }

  return (
    <main style={{ background: COLORS.page, color: COLORS.heading, minHeight: '100%', padding: '30px 34px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1, minWidth: 0, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {['Basics', 'Brief', 'Structure'].map((label, i) => {
          const n = i + 1
          const state = n < step ? 'done' : n === step ? 'current' : 'pending'
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: n < 3 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: state === 'pending' ? '#DDE3EC' : state === 'current' ? COLORS.orange : COLORS.navy,
                  color: state === 'pending' ? COLORS.textFaint : '#fff',
                  display: 'grid', placeItems: 'center', font: '600 11px "Instrument Sans",sans-serif',
                }}>{n}</div>
                <span style={{ fontSize: 12.5, fontWeight: state === 'pending' ? 400 : 600, color: state === 'pending' ? COLORS.textFaint : COLORS.heading }}>{label}</span>
              </div>
              {n < 3 && <div style={{ flex: 1, height: 1, background: 'rgba(20,55,125,.14)' }} />}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
          <div>
            <h1 style={{ margin: 0, font: "400 32px/1.05 'Instrument Serif',serif" }}>Who's the client?</h1>
          </div>
          <label style={{ fontSize: 12, color: COLORS.textFaint }}>Client name
            <input value={basics.name} onChange={e => setBasics({ ...basics, name: e.target.value })} placeholder="e.g. Northmoor Group"
              style={{ display: 'block', width: '100%', marginTop: 5, padding: '9px 12px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 8, fontSize: 13.5, boxSizing: 'border-box' }} />
          </label>
          <label style={{ fontSize: 12, color: COLORS.textFaint }}>Engagement summary
            <input value={basics.tagline} onChange={e => setBasics({ ...basics, tagline: e.target.value })} placeholder="e.g. Strategy + LinkedIn build"
              style={{ display: 'block', width: '100%', marginTop: 5, padding: '9px 12px', border: `1px solid ${COLORS.borderStrong}`, borderRadius: 8, fontSize: 13.5, boxSizing: 'border-box' }} />
          </label>
          <div>
            <div style={{ fontSize: 12, color: COLORS.textFaint, marginBottom: 6 }}>Stage</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {STAGES.map(s => (
                <span key={s} onClick={() => setBasics({ ...basics, stage: s })} style={{
                  padding: '5px 10px', borderRadius: 20, fontSize: 11.5, cursor: 'pointer',
                  background: basics.stage === s ? COLORS.navy : 'transparent', color: basics.stage === s ? '#fff' : COLORS.heading,
                  border: `1px solid ${basics.stage === s ? COLORS.navy : COLORS.borderStrong}`, fontWeight: basics.stage === s ? 600 : 400,
                }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: COLORS.textFaint, marginBottom: 6 }}>Account lead</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {team.map(m => (
                <span key={m.id} onClick={() => setBasics({ ...basics, lead: m.id })} style={{
                  padding: '5px 10px', borderRadius: 20, fontSize: 11.5, cursor: 'pointer',
                  background: basics.lead === m.id ? COLORS.navy : 'transparent', color: basics.lead === m.id ? '#fff' : COLORS.heading,
                  border: `1px solid ${basics.lead === m.id ? COLORS.navy : COLORS.borderStrong}`, fontWeight: basics.lead === m.id ? 600 : 400,
                }}>{m.name}</span>
              ))}
              {team.length === 0 && <span style={{ fontSize: 11.5, color: COLORS.textFaint, fontStyle: 'italic' }}>Add a teammate first</span>}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h1 style={{ margin: 0, font: "400 32px/1.05 'Instrument Serif',serif" }}>Paste whatever you've got.</h1>
            <p style={{ margin: '9px 0 0', fontSize: 13.5, color: COLORS.textMuted }}>
              Workshop notes, a proposal, a messy email thread. Claude pulls out the positioning, ICPs and things to avoid — you correct it.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ font: '500 10px "IBM Plex Mono",monospace', letterSpacing: '.09em', color: COLORS.textFaint }}>SOURCE</div>
              <textarea value={source} onChange={e => setSource(e.target.value)} rows={10} placeholder="Paste discovery notes, a brief, an email thread…"
                style={{ width: '100%', marginTop: 10, padding: '8px 10px', border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 12.5, lineHeight: 1.6, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              <Button variant="outline" onClick={extract} style={{ marginTop: 10 }}>Extract with Claude</Button>
            </div>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ font: '500 10px "IBM Plex Mono",monospace', letterSpacing: '.09em', color: COLORS.textFaint }}>CLAUDE'S READ</div>
                <span style={{ fontSize: 11, color: COLORS.blue }}>everything editable</span>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint }}>Positioning (draft)</div>
                <textarea value={read.positioning} onChange={e => setRead({ ...read, positioning: e.target.value })} rows={2}
                  style={{ width: '100%', marginTop: 4, padding: '8px 11px', border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 12.5, lineHeight: 1.5, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint }}>ICPs</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 5 }}>
                  {read.icps.map(icp => (
                    <span key={icp} onClick={() => removeIcp(icp)} style={{ padding: '4px 9px', borderRadius: 6, background: '#EEF1F6', fontSize: 11.5, cursor: 'pointer' }}>{icp} ✕</span>
                  ))}
                  <input value={icpInput} onChange={e => setIcpInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIcp() } }}
                    placeholder="+ add" style={{ border: `1px dashed ${COLORS.borderStrong}`, borderRadius: 6, padding: '4px 9px', fontSize: 11.5, width: 90 }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: COLORS.textFaint }}>Never say</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 5 }}>
                  {read.neverSay.length === 0 && <span style={{ fontSize: 11.5, color: COLORS.textFaint, fontStyle: 'italic' }}>none captured</span>}
                  {read.neverSay.map(n => (
                    <span key={n} style={{ padding: '4px 9px', borderRadius: 6, background: '#FDE7D3', color: COLORS.orangeDark, fontSize: 11.5 }}>"{n}"</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, font: "400 32px/1.05 'Instrument Serif',serif" }}>Proposed structure</h1>
            <p style={{ margin: '9px 0 0', fontSize: 13.5, color: COLORS.textMuted }}>2 projects · 7 starter tasks. Adjust later from the client workspace.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '11px 13px' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Discovery & positioning</div>
              <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 4 }}>4 tasks · confirm ICPs, positioning, kickoff</div>
            </div>
            <div style={{ flex: 1, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '11px 13px' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Content programme</div>
              <div style={{ fontSize: 11.5, color: COLORS.textFaint, marginTop: 4 }}>3 tasks · starts after sign-off</div>
            </div>
          </div>
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{basics.name || 'New client'}</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{basics.tagline || 'New engagement'} · {basics.stage} · lead {team.find(m => m.id === basics.lead)?.name || '—'}</div>
            {read.positioning && <div style={{ fontSize: 12.5, color: COLORS.text, marginTop: 8, fontStyle: 'italic' }}>"{read.positioning}"</div>}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 'auto' }}>
        <Button variant="outline" onClick={step === 1 ? onCancel : () => setStep(step - 1)}>{step === 1 ? 'Cancel' : 'Back'}</Button>
        {step < 3
          ? <Button variant="accent" onClick={() => setStep(step + 1)} disabled={step === 1 && !basics.name.trim()}>Continue</Button>
          : <Button variant="accent" onClick={create}>Create workspace</Button>}
      </div>
    </main>
  )
}
