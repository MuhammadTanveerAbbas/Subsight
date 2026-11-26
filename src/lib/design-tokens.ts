export type ThemeKey = 'dark' | 'light';

export const DARK_TOKENS: Record<string, string> = {
  '--bg':            '#000000',
  '--surface':       '#0a0a0a',
  '--surface2':      '#141414',
  '--surface3':      '#1e1e1e',
  '--border':        '#2a2a2a',
  '--border2':       '#3a3a3a',
  '--text':          '#ffffff',
  '--text2':         'rgba(255,255,255,0.62)',
  '--text3':         'rgba(255,255,255,0.45)',
  '--green':         '#22c55e',
  '--green2':        '#16a34a',
  '--green-ink':     '#4ade80',
  '--green-dim':     'rgba(34,197,94,0.08)',
  '--green-border':  'rgba(34,197,94,0.22)',
  '--green-glow':    'rgba(34,197,94,0)',
  '--red':           '#ef4444',
  '--red-dim':       'rgba(239,68,68,0.10)',
  '--amber':         '#f59e0b',
  '--amber-dim':     'rgba(245,158,11,0.10)',
  '--blue':          '#3b82f6',
  '--blue-dim':      'rgba(59,130,246,0.10)',
  '--sidebar-bg':    '#000000',
  '--nav-bg':        'rgba(11,12,10,0.94)',
  '--shadow':        'rgba(0,0,0,0.50)',
  '--grid':          'rgba(255,255,255,0.03)',
};

export const LIGHT_TOKENS: Record<string, string> = {
  '--bg':            '#ffffff',
  '--surface':       '#f5f5f5',
  '--surface2':      '#ebebeb',
  '--surface3':      '#e1e1e1',
  '--border':        '#d4d4d4',
  '--border2':       '#bcbcbc',
  '--text':          '#000000',
  '--text2':         'rgba(0,0,0,0.62)',
  '--text3':         'rgba(0,0,0,0.42)',
  '--green':         '#16a34a',
  '--green2':        '#128038',
  '--green-ink':     '#15743c',
  '--green-dim':     'rgba(22,163,74,0.08)',
  '--green-border':  'rgba(22,163,74,0.22)',
  '--green-glow':    'rgba(22,163,74,0)',
  '--red':           '#dc2626',
  '--red-dim':       'rgba(220,38,38,0.10)',
  '--amber':         '#d97706',
  '--amber-dim':     'rgba(217,119,6,0.10)',
  '--blue':          '#2563eb',
  '--blue-dim':      'rgba(37,99,235,0.10)',
  '--sidebar-bg':    '#ffffff',
  '--nav-bg':        'rgba(247,247,243,0.94)',
  '--shadow':        'rgba(0,0,0,0.10)',
  '--grid':          'rgba(0,0,0,0.03)',
};

export const DEFAULT_THEME: ThemeKey = 'light';

export function applyTokens(theme: ThemeKey): void {
  const tokens = theme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS;
  const root = document.documentElement;
  Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('data-theme', theme);
  root.classList.toggle('dark', theme === 'dark');
}

export function getStoredTheme(): ThemeKey {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem('subsight-theme');
  return stored === 'dark' || stored === 'light' ? stored : DEFAULT_THEME;
}

export function storeTheme(theme: ThemeKey): void {
  localStorage.setItem('subsight-theme', theme);
}
