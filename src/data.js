// Mock data for the Agency OS prototype. Everything here is fictional sample content
// modeled on the original design exploration — not real client data.

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
  {
    id: 'drliz',
    name: 'Dr Liz',
    fullName: 'Dr Liz Harrow',
    tagline: 'Personal brand + content programme',
    stage: 'DISCOVERY',
    lead: 'nadha',
    started: '19 July',
    nextCheckIn: 'TBC',
    lastCheckIn: null,
    brief: 'Consultant psychiatrist moving into corporate wellbeing advisory. Wants to be known for the "burnout is an operating model problem" argument, not generic wellness. Audience is HR directors and people-ops leads at 200–2000 person firms. Has 4k LinkedIn followers, posts twice a year.',
    icps: ['HR director, 200–2000 staff', 'People-ops lead'],
    positioning: 'Burnout as an operating-model failure, not an individual one.',
    neverSay: ['thought leader'],
    contacts: [
      { name: 'Dr Liz Harrow', role: 'Founder · decision maker', initials: 'LH' },
    ],
    narrative: {
      text: "Workshop done. Waiting on her ICP notes — 9 days. Chase drafted, not sent.",
      updatedAgo: '1d ago',
    },
    stageProgress: ['current', 'empty', 'empty', 'empty', 'empty'],
  },
  {
    id: 'harbourline',
    name: 'Harbourline Legal',
    tagline: 'Ongoing marketing ops',
    stage: 'ONGOING',
    lead: 'nadha',
    started: '3 Feb',
    nextCheckIn: 'Fri',
    lastCheckIn: 'Fri 25 July',
    brief: 'Mid-size commercial law firm. Monthly newsletter, LinkedIn presence and the occasional explainer piece for partners.',
    icps: ['Ops/finance director, SME', 'GC, mid-market company'],
    positioning: 'The firm that explains the law in plain English.',
    neverSay: [],
    contacts: [
      { name: 'Aisha Fernando', role: 'Marketing manager', initials: 'AF' },
    ],
    narrative: {
      text: 'July newsletter out Thursday. Nothing blocked. Check-in logged Friday.',
      updatedAgo: '1d ago',
    },
    stageProgress: ['done', 'done', 'done', 'done', 'done'],
  },
  {
    id: 'verity',
    name: 'Verity Fintech',
    tagline: 'Strategy sprint',
    stage: 'STRATEGY',
    lead: 'dilni',
    started: '8 July',
    nextCheckIn: '5 Aug',
    lastCheckIn: null,
    brief: 'B2B payments infrastructure for mid-market retailers. Needs a messaging house before any content work starts.',
    icps: ['Head of payments, retail', 'CFO, mid-market retail'],
    positioning: 'Draft in progress.',
    neverSay: [],
    contacts: [
      { name: 'Sam Okafor', role: 'CMO', initials: 'SO' },
    ],
    narrative: {
      text: 'Messaging house v2 with Dilni. Readout booked 5 Aug.',
      updatedAgo: '3d ago',
    },
    stageProgress: ['done', 'done', 'empty', 'empty', 'empty'],
  },
  {
    id: 'northmoor',
    name: 'Northmoor Group',
    tagline: 'Case study & testimonials',
    stage: 'ONGOING',
    lead: 'dilni',
    started: '2 Jan',
    nextCheckIn: 'Mon',
    lastCheckIn: 'Mon 21 July',
    brief: 'Industrial logistics group. Building a testimonial and case-study library off the back of a successful 2025 campaign.',
    icps: ['Ops director, logistics', 'Supply chain lead'],
    positioning: 'Proven at scale — the numbers do the talking.',
    neverSay: [],
    contacts: [
      { name: 'Priya Nandakumar', role: 'Head of marketing', initials: 'PN' },
    ],
    narrative: {
      text: 'Testimonial approval has stalled — chased twice, nothing back in three weeks. Everything else on track.',
      updatedAgo: '4h ago',
    },
    stageProgress: ['done', 'done', 'done', 'current', 'empty'],
  },
]

export const PROJECTS = [
  { id: 'p-6020-li', clientId: '6020energy', name: 'LinkedIn build', owner: 'nadha', done: 6, total: 11, status: 'active', note: '2 overdue' },
  { id: 'p-6020-cs', clientId: '6020energy', name: 'Case study programme', owner: 'dilni', done: 1, total: 7, status: 'blocked', note: 'blocked' },
  { id: 'p-6020-strat', clientId: '6020energy', name: 'Strategy & positioning', owner: 'nadha', done: 1, total: 1, status: 'done', note: 'complete' },
  { id: 'p-liz-disc', clientId: 'drliz', name: 'Discovery & positioning', owner: 'nadha', done: 2, total: 4, status: 'active', note: '2 waiting on Liz' },
  { id: 'p-liz-li', clientId: 'drliz', name: 'LinkedIn presence', owner: 'nadha', done: 0, total: 3, status: 'active', note: 'starts after sign-off' },
  { id: 'p-harb-ops', clientId: 'harbourline', name: 'Ongoing marketing ops', owner: 'nadha', done: 3, total: 3, status: 'active', note: 'on track' },
  { id: 'p-verity-strat', clientId: 'verity', name: 'Strategy sprint', owner: 'dilni', done: 4, total: 6, status: 'active', note: 'readout 5 Aug' },
  { id: 'p-north-cs', clientId: 'northmoor', name: 'Case study & testimonials', owner: 'dilni', done: 5, total: 8, status: 'blocked', note: 'blocked' },
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

  t({ clientId: 'drliz', projectId: 'p-liz-disc', title: 'ICP notes from workshop', owner: 'Dr Liz Harrow', ownerType: 'client', priority: 'Med', waitingDays: 9, waitingOn: 'Dr Liz Harrow', blocks: 'blocks the strategy doc', chasedCount: 0, column: 'with_client', due: 'waiting 9d' }),
  t({ clientId: 'drliz', projectId: 'p-liz-li', title: 'Book brand photography day', owner: 'dilni', ownerType: 'team', priority: 'Low', due: '8 Aug', column: 'backlog' }),

  t({ clientId: 'harbourline', projectId: 'p-harb-ops', title: 'July newsletter — final proof', owner: 'nadha', ownerType: 'team', priority: 'Med', due: 'Thu', column: 'drafting' }),

  t({ clientId: 'verity', projectId: 'p-verity-strat', title: 'Messaging house v2', owner: 'dilni', ownerType: 'team', priority: 'High', due: 'Thu', column: 'drafting' }),

  t({ clientId: 'northmoor', projectId: 'p-north-cs', title: 'Testimonial approval — Northmoor', owner: 'Priya Nandakumar', ownerType: 'client', priority: 'High', waitingDays: 21, waitingOn: 'Priya Nandakumar', blocks: 'blocks the case study page', chasedCount: 2, cold: true, column: 'with_client', due: 'gone cold' }),
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

export function chaseItems(tasks) {
  return tasks
    .filter(t => t.waitingDays != null)
    .sort((a, b) => b.waitingDays - a.waitingDays)
}
