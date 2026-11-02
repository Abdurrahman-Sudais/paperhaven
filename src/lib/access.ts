/** Demo roles and people. In production these are identity-provider groups, checked again on the server. */
export type DemoRole = 'manager' | 'planner' | 'grader' | 'viewer'
export type Action = 'batches' | 'documents' | 'scenarios' | 'spec' | 'audit'

export interface DemoUser {
  id: string
  name: string
  title: string
  initials: string
  role: DemoRole
}

/** Fictional people for the demo workspace. */
export const DEMO_USERS: DemoUser[] = [
  { id: 'u-chidi', name: 'Chidi Okeke', title: 'Quality manager', initials: 'CO', role: 'manager' },
  { id: 'u-hannah', name: 'Hannah Fisher', title: 'Blend planner', initials: 'HF', role: 'planner' },
  { id: 'u-bola', name: 'Bola Adebayo', title: 'Yard grader', initials: 'BA', role: 'grader' },
  { id: 'u-mark', name: 'Mark Ellis', title: 'Commercial lead', initials: 'ME', role: 'viewer' },
]

export const ROLE_LABEL: Record<DemoRole, string> = {
  manager: 'Quality manager',
  planner: 'Blend planner',
  grader: 'Yard grader',
  viewer: 'Viewer (read only)',
}

export const ACTION_LABEL: Record<Action, string> = {
  batches: 'Add and edit incoming batches',
  documents: 'Attach and remove batch documents',
  scenarios: 'Save and delete blend scenarios',
  spec: 'Change the production specification',
  audit: 'Read and export the audit log',
}

export const ACTIONS = Object.keys(ACTION_LABEL) as Action[]

const MATRIX: Record<DemoRole, Action[]> = {
  manager: ACTIONS,
  planner: ['scenarios'],
  grader: ['batches', 'documents'],
  viewer: [],
}

export const can = (role: DemoRole, action: Action) => MATRIX[role].includes(action)
export const userById = (id: string): DemoUser => DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0]!

export interface AuditEntry {
  id: string
  at: string
  userId: string
  action: Action
  detail: string
}
