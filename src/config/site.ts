export const SITE = { name: 'Paperhaven', url: 'https://paperhaven.top', domain: 'paperhaven.top', email: 'ifeoma@paperhaven.top' }

export interface Person {
  name: string
  initials: string
  role: string
  email?: string
  bio: string
  focus: string[]
}

/** The founding team, credited on the home page, About, Contact and in the footer. */
export const FOUNDERS: Person[] = [
  {
    name: 'Ifeoma Ezeani',
    initials: 'IE',
    role: 'Founder/CEO',
    email: SITE.email,
    bio: 'Ifeoma founded Paperhaven so recycling businesses and mills can plan every blend from measurements they trust — and leads product, customers and every pilot.',
    focus: ['Product', 'Customers', 'Pilots'],
  },
  {
    name: 'Yusuf Abdulhamid',
    initials: 'YA',
    role: 'Co-founder/CTO',
    bio: 'Yusuf co-founded Paperhaven and leads its technology — from batch and document capture and the blend-calculation engine to the cloud platform it runs on.',
    focus: ['Batch records', 'Blend engine', 'Cloud platform'],
  },
]
