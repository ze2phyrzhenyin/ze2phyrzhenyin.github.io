export const SITE = {
  name: 'Zhaoyang SUI',
  nameZh: '隋朝阳',
  tagline: 'Master\'s Student · Theoretical Computer Science',
  description: 'Personal site — research, writing, and projects at the intersection of logic, mathematics, and computation.',
  url: 'https://yourname.dev',
  author: 'Zhaoyang SUI',
  email: 'you@example.com',
  github: 'https://github.com/yourhandle',
  twitter: 'https://twitter.com/yourhandle',
  googleScholar: '',
  orcid: '',
  institution: 'Your University',
  department: 'Department of Computer Science',
  avatar: '/images/avatar/avatar.jpg',
} as const;

export function getSiteName(lang?: string) {
  return lang === 'zh' ? SITE.nameZh : SITE.name;
}

export const NAV = [
  { label: 'About',        href: '/about' },
  { label: 'Blog',         href: '/blog' },
  { label: 'Essays',       href: '/essays' },
  { label: 'Publications', href: '/publications' },
  { label: 'Projects',     href: '/projects' },
  { label: 'Life',         href: '/life' },
  { label: 'Contact',      href: '/contact' },
] as const;

export const BLOG_CATEGORIES = [
  { id: 'logic',  label: 'Logic',       color: 'badge-logic',  description: 'Mathematical logic, proof theory, model theory' },
  { id: 'math',   label: 'Mathematics', color: 'badge-math',   description: 'Analysis, algebra, topology, combinatorics' },
  { id: 'ai',     label: 'AI/ML',       color: 'badge-ai',     description: 'Machine learning, neural networks, theory of learning' },
  { id: 'cs',     label: 'CS Theory',   color: 'badge-cs',     description: 'Complexity, algorithms, computability, type theory' },
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number]['id'];
