import { useMemo, useState } from 'react'
import { COLORS, FONT_MONO, PRIORITY_COLOR } from '../theme.js'
import { Button } from './ui.jsx'
import { todayISO, formatDate } from '../dates.js'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function pad2(n) { return String(n).padStart(2, '0') }
function isoOf(y, m, d) { return `${y}-${pad2(m + 1)}-${pad2(d)}` }

// 6 full weeks (42 cells) covering the month plus the lead/trail days needed
// to complete each week — built by walking a running Date, never reparsing
// an ISO string (which Date() treats as UTC and can shift by a day).
function buildGrid(year, month) {
  const startOffset = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const cursor = new Date(year, month, 1 - startOffset)
  const cells = []
  for (let i = 0; i < totalCells; i++) {
    cells.push({ iso: isoOf(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()), day: cursor.getDate(), inMonth: cursor.getMonth() === month })
    cursor.setDate(cursor.getDate() + 1)
  }
  return cells
}

function taskChipStyle(t) {
  if (t.overdueDays) return { background: '#FDE7D3', color: COLORS.orangeDark }
  if (t.waitingDays != null) return { background: '#FEF1D3', color: COLORS.amberDark }
  return { background: '#EEF1F6', color: PRIORITY_COLOR[t.priority] || COLORS.text }
}

export default function Calendar({ tasks, clients, onEditTask, onOpenCheckIn }) {
  const today = todayISO()
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedIso, setSelectedIso] = useState(today)

  const clientName = id => clients.find(c => c.id === id)?.name || id

  const itemsByDay = useMemo(() => {
    const map = {}
    tasks.forEach(t => {
      if (!t.dueDate) return
      const list = map[t.dueDate] || (map[t.dueDate] = [])
      list.push({ kind: 'task', sortKey: t.overdueDays ? 0 : t.waitingDays != null ? 1 : 2, task: t })
    })
    clients.forEach(c => {
      if (!c.nextCheckInDate) return
      const list = map[c.nextCheckInDate] || (map[c.nextCheckInDate] = [])
      list.push({ kind: 'checkin', sortKey: -1, client: c })
    })
    Object.values(map).forEach(list => list.sort((a, b) => a.sortKey - b.sortKey))
    return map
  }, [tasks, clients])

  const cells = useMemo(() => buildGrid(cursor.year, cursor.month), [cursor])

  function shiftMonth(delta) {
    setCursor(c => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function goToday() {
    const d = new Date()
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
    setSelectedIso(today)
  }

  function openItem(item) {
    if (item.kind === 'task') onEditTask(item.task)
    else onOpenCheckIn(item.client.id)
  }

  const selectedItems = itemsByDay[selectedIso] || []

  return (
    <main style={{ padding: '30px 34px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1, minWidth: 0 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ font: `500 10px ${FONT_MONO}`, letterSpacing: '.10em', color: COLORS.textFaint }}>CALENDAR</div>
          <h1 style={{ margin: '6px 0 0', font: "400 32px/1 'Instrument Serif',serif" }}>Due dates & check-ins</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button variant="outline" onClick={goToday}>Today</Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span onClick={() => shiftMonth(-1)} style={{ cursor: 'pointer', fontSize: 16, color: COLORS.textFaint, padding: '0 4px' }}>‹</span>
            <span style={{ font: '600 14px "Instrument Sans",sans-serif', minWidth: 150, textAlign: 'center' }}>{MONTH_LABELS[cursor.month]} {cursor.year}</span>
            <span onClick={() => shiftMonth(1)} style={{ cursor: 'pointer', fontSize: 16, color: COLORS.textFaint, padding: '0 4px' }}>›</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#EFF3F8', borderBottom: `1px solid ${COLORS.border}` }}>
            {WEEKDAY_LABELS.map(w => (
              <div key={w} style={{ padding: '8px 10px', font: `600 10px ${FONT_MONO}`, letterSpacing: '.06em', color: COLORS.textFaint }}>{w}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map(cell => {
              const items = itemsByDay[cell.iso] || []
              const isToday = cell.iso === today
              const isSelected = cell.iso === selectedIso
              return (
                <div
                  key={cell.iso}
                  onClick={() => setSelectedIso(cell.iso)}
                  style={{
                    minHeight: 92, padding: '7px 8px', borderRight: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`,
                    cursor: 'pointer', background: isSelected ? '#F7FAFD' : 'transparent', opacity: cell.inMonth ? 1 : 0.4,
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                >
                  <span style={{
                    font: '600 11.5px "Instrument Sans",sans-serif', width: 20, height: 20, borderRadius: '50%',
                    display: 'grid', placeItems: 'center',
                    background: isToday ? COLORS.orange : 'transparent', color: isToday ? '#fff' : COLORS.heading,
                  }}>{cell.day}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {items.slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        onClick={e => { e.stopPropagation(); openItem(item) }}
                        title={item.kind === 'task' ? item.task.title : `${clientName(item.client.id)} check-in`}
                        style={{
                          fontSize: 10.5, padding: '2px 5px', borderRadius: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          ...(item.kind === 'checkin' ? { background: COLORS.navy, color: '#fff' } : taskChipStyle(item.task)),
                        }}
                      >
                        {item.kind === 'checkin' ? `${clientName(item.client.id)} check-in` : item.task.title}
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div style={{ fontSize: 10, color: COLORS.textFaint }}>+{items.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '15px 17px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ font: '600 13px "Instrument Sans",sans-serif' }}>{selectedIso === today ? 'Today' : formatDate(selectedIso)}</div>
          {selectedItems.length === 0 && <div style={{ fontSize: 12.5, color: COLORS.textFaint, fontStyle: 'italic' }}>Nothing scheduled.</div>}
          {selectedItems.map((item, i) => (
            <div key={i} onClick={() => openItem(item)} style={{
              padding: '9px 11px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${COLORS.border}`,
              display: 'flex', flexDirection: 'column', gap: 3,
            }}>
              {item.kind === 'checkin' ? (
                <>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{clientName(item.client.id)}</span>
                  <span style={{ fontSize: 11, color: COLORS.textFaint }}>Weekly check-in due</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{item.task.title}</span>
                  <span style={{ fontSize: 11, color: COLORS.textFaint }}>
                    {clientName(item.task.clientId)}{item.task.overdueDays ? ` · ${item.task.overdueDays}d overdue` : item.task.waitingDays != null ? ` · waiting ${item.task.waitingDays}d` : ''}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
