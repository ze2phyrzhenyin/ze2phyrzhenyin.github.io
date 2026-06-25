export const SITE = {
  name: 'Zhaoyang SUI',
  nameZh: '隋朝阳',
  tagline: 'Incoming Master 1 in Computer-Assisted Business Management (MIAGE) · Université Toulouse 1 Capitole',
  description: 'Personal site — software engineering, applied AI, research, writing, and projects.',
  url: 'https://ze2phyrzhenyin.github.io',
  author: 'Zhaoyang SUI',
  email: 'zhaoyang.sui@ut-capitole.fr',
  github: '',
  contact: {
    wechat: 'cebasmonde',
    linkedin: 'https://www.linkedin.com/in/zhaoyang-sui-6260a539b/',
    github: 'https://github.com/ze2phyrzhenyin',
    codeforces: 'https://codeforces.com/profile/ze2phyr_zhenyin',
    instagram: 'https://www.instagram.com/ze2phyr/',
  },
  twitter: '',
  googleScholar: '',
  orcid: '',
  institution: 'Université Toulouse 1 Capitole',
  department: 'MIAGE',
  avatar: '/images/avatar/avatar.jpg',
} as const;

export function getSiteName(lang?: string) {
  return lang === 'zh' ? SITE.nameZh : SITE.name;
}

export function formatEmailForDisplay(email: string) {
  const [local, domain] = email.split('@');
  return `${local.replaceAll('.', ' dot ')} at ${domain.replaceAll('.', ' dot ')}`;
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
