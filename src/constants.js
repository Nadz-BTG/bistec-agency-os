// Single source of truth for every fixed set of options in the app, so
// labels and available choices stay identical everywhere they appear.

export const STAGES = ['Discovery', 'Strategy', 'Delivery', 'Ongoing']

export const PRIORITIES = ['High', 'Med', 'Low']

export const PROJECT_STATUSES = ['active', 'blocked', 'done']

export const OWNER_TYPES = [
  { value: 'team', label: 'Team' },
  { value: 'client', label: 'Client contact' },
  { value: 'external', label: 'External' },
]

export const TASK_COLUMNS = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'drafting', label: 'Drafting' },
  { key: 'with_client', label: 'With client' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'live', label: 'Live' },
]

export const TEAM_ROLES = [
  'Account lead',
  'Strategist',
  'Creative lead',
  'Copywriter',
  'Designer',
  'Account manager',
  'Freelancer',
]
