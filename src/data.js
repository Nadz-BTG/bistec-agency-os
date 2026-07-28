// Seed data for the Agency OS prototype. Fictional sample content for one
// worked example client — everything else starts empty for real use.

export const TEAM = [
  { id: 'nadha', name: 'Nadha', initials: 'NP', role: 'account lead', color: '#F58021', textColor: '#0B1D3E' },
  { id: 'dilni', name: 'Dilni', initials: 'DL', role: 'strategist', color: '#006FB9', textColor: '#fff' },
]

export const CLIENTS = [
  {
    id: '6020energy',
    name: '6020Energy',
    tagline: 'Strategy + LinkedIn build',
    stage: 'DELIVERY',
    lead: 'nadha',
    started: '12 May',
    nextCheckIn: 'Fri',
    lastCheckIn: 'Fri 25 July',
    brief: 'Commercial solar & battery for mid-market industrial sites. Selling into ops directors who care about downtime, not carbon.',
    icps: ['Ops director, manufacturing', 'Facilities lead, cold chain', 'CFO, 50–250 staff'],
    positioning: 'Energy independence without an engineering department.',
    neverSay: [],
    contacts: [
      { name: 'Marcus Kelly', role: 'MD · decision maker', initials: 'MK' },
      { name: 'Jo Raines', role: 'Marketing coordinator · day-to-day', initials: 'JR' },
    ],
    narrative: {
      text: "Positioning and messaging signed off on 3 July. The LinkedIn build is the live workstream: six posts drafted, two sitting with Marcus for review since Thursday. Case-study interviews are the risk — Jo hasn't come back with site contacts and that blocks the whole August content run.",
      updatedAgo: '2h ago',
    },
    stageProgress: ['done', 'done', 'current', 'empty', 'empty'],
  },
]

export const PROJECTS = [
  { id: 'p-6020-li', clientId: '6020energy', name: 'LinkedIn build', owner: 'nadha', done: 6, total: 11, status: 'active', note: '2 overdue' },
  { id: 'p-6020-cs', clientId: '6020energy', name: 'Case study programme', owner: 'dilni', done: 1, total: 7, status: 'blocked', note: 'blocked' },
  { id: 'p-6020-strat', clientId: '6020energy', name: 'Strategy & positioning', owner: 'nadha', done: 1, total: 1, status: 'done', note: 'complete' },
]

let taskSeq = 0
function t(fields) {
  taskSeq += 1
  return {
    id: `t-${taskSeq}`,
    projectId: null,
    priority: 'Med',
    due: null,
    overdueDays: null,
    waitingDays: null,
    waitingOn: null,
    blocks: null,
    chasedCount: 0,
    cold: false,
    column: 'backlog',
    status: 'open',
    progress: null,
    note: null,
    done: false,
    ...fields,
  }
}

export const TASKS = [
  t({ clientId: '6020energy', projectId: 'p-6020-li', title: 'Review post 4 — "The downtime maths"', owner: 'Marcus', ownerType: 'client', priority: 'High', overdueDays: 3, waitingOn: 'Marcus', blocks: "Marcus's sign-off", chasedCount: 1, column: 'with_client', progress: 70, due: '3d overdue' }),
  t({ clientId: '6020energy', projectId: 'p-6020-cs', title: 'Site contacts for case study interviews', owner: 'Jo', ownerType: 'client', priority: 'High', waitingDays: 9, waitingOn: 'Jo', blocks: 'blocks 4 tasks', chasedCount: 1, column: 'with_client', due: 'waiting 9d' }),
  t({ clientId: '6020energy', projectId: 'p-6020-li', title: 'Draft August content calendar', owner: 'nadha', ownerType: 'team', priority: 'Med', due: 'Fri', column: 'drafting', note: 'Claude draft ready' }),
  t({ clientId: '6020energy', projectId: 'p-6020-li', title: 'Post 5 — "The downtime cost nobody models"', owner: 'nadha', ownerType: 'team', priority: 'Med', due: 'Wed', column: 'drafting', note: 'Claude draft ready' }),
  t({ clientId: '6020energy', projectId: 'p-6020-li', title: 'Schedule posts 1–3 in Buffer', owner: 'dilni', ownerType: 'team', priority: 'Low', due: 'Wed', column: 'drafting' }),
  t({ clientId: '6020energy', projectId: 'p-6020-li', title: 'Rewrite company page boilerplate', owner: 'nadha', ownerType: 'team', priority: 'Low', due: '1 Aug', column: 'backlog' }),
  t({ clientId: '6020energy', projectId: 'p-6020-li', title: 'Employee advocacy one-pager', owner: 'dilni', ownerType: 'team', priority: 'Low', due: null, column: 'backlog' }),
  t({ clientId: '6020energy', projectId: 'p-6020-cs', title: 'Headshots for team profiles', owner: 'Jo', ownerType: 'client', priority: 'Med', waitingDays: 6, column: 'with_client', due: '6d' }),
  t({ clientId: '6020energy', projectId: 'p-6020-cs', title: 'Interview #1 — Ballarat cold store', owner: 'nadha', ownerType: 'team', priority: 'Med', column: 'backlog', note: 'blocked on site contacts' }),
  t({ clientId: '6020energy', projectId: 'p-6020-li', title: 'Posts 1–3 queued in Buffer', owner: 'dilni', ownerType: 'team', priority: 'Low', due: '29 Jul', column: 'scheduled' }),
  t({ clientId: '6020energy', projectId: 'p-6020-li', title: 'Marcus profile rewrite', owner: 'nadha', ownerType: 'team', column: 'live', status: 'live', note: 'Live 22 Jul · 41 reactions' }),
  t({ clientId: '6020energy', projectId: 'p-6020-li', title: 'Post 1 — "Why we stopped selling panels"', owner: 'nadha', ownerType: 'team', column: 'live', status: 'live', note: 'Live 18 Jul · 2 inbound' }),
  t({ clientId: '6020energy', projectId: 'p-6020-cs', title: 'Photographer quote — Ballarat site', owner: 'Ravi', ownerType: 'external', priority: 'Low', due: '4 Aug', column: 'backlog' }),
]

export const CHECKINS = [
  {
    id: 'ci-6020-0728',
    clientId: '6020energy',
    week: 'Week of 28 July',
    status: 'draft',
    wentOut: ['Posts 1–3 scheduled in Buffer', 'Marcus profile rewrite live — 41 reactions', 'Post 4 sent for review'],
    cameIn: ['Ballarat performance data from Marcus', 'Two inbound enquiries credited to post 1'],
    outstanding: ['Site contacts from Jo — 9 days', 'Post 4 sign-off — 3 days over', 'Headshots for team profiles'],
    nextPriority: "Unblock the case study programme. Everything in August's calendar depends on those interviews being booked by Wednesday.",
    notes: 'Marcus mentioned a possible Q4 budget for video. Worth a proposal after the case studies land.',
  },
]
