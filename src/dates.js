// Date utilities. All dates are stored/passed as 'YYYY-MM-DD' strings — the
// same format native <input type="date"> uses, so no parsing library needed.

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function toDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function fromDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO() {
  return fromDate(new Date())
}

export function addDays(iso, n) {
  const d = toDate(iso)
  d.setDate(d.getDate() + n)
  return fromDate(d)
}

export function daysAgo(n) {
  return addDays(todayISO(), -n)
}

export function daysFromNow(n) {
  return addDays(todayISO(), n)
}

export function nextWeekdayISO(name) {
  const target = WEEKDAYS.indexOf(name)
  const now = new Date()
  const diff = (target - now.getDay() + 7) % 7
  return addDays(todayISO(), diff)
}

// b - a, in whole days. Second arg defaults to today.
export function daysBetween(fromISO, toISO = todayISO()) {
  return Math.round((toDate(toISO) - toDate(fromISO)) / 86400000)
}

export function formatDate(iso) {
  if (!iso) return null
  const d = toDate(iso)
  const withYear = d.getFullYear() !== new Date().getFullYear()
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${withYear ? ` ${d.getFullYear()}` : ''}`
}

export function formatWeekday(iso) {
  return WEEKDAYS[toDate(iso).getDay()]
}

// "Today" / "Tomorrow" / weekday name (within 6 days) / short date otherwise.
export function relativeDayLabel(iso) {
  if (!iso) return null
  const diff = daysBetween(todayISO(), iso)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff > 1 && diff <= 6) return formatWeekday(iso)
  return formatDate(iso)
}

export function overdueDaysFor(task) {
  if (task.askedDate || !task.dueDate) return null
  const diff = daysBetween(todayISO(), task.dueDate)
  return diff < 0 ? -diff : null
}

export function waitingDaysFor(task) {
  return task.askedDate ? daysBetween(task.askedDate) : null
}

// Single compact label for the DUE column / kanban footer.
export function dueLabelFor(task) {
  if (task.askedDate) {
    const d = waitingDaysFor(task)
    if (task.cold || d >= 14) return 'gone cold'
    return `waiting ${d}d`
  }
  const overdue = overdueDaysFor(task)
  if (overdue) return `${overdue}d overdue`
  if (task.dueDate) return relativeDayLabel(task.dueDate)
  return null
}
