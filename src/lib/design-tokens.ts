export type ThemeKey = 'dark' | 'light';

export const DARK_TOKENS: Record<string, string> = {
  '--bg':            '#080808',
  '--surface':       '#111111',
  '--surface2':      '#181818',
  '--surface3':      '#1e1e1e',
  '--border':        '#1f1f1f',
  '--border2':       '#2a2a2a',
  '--text':          '#f0f0f0',
  '--text2':         '#a0a0a0',
  '--text3':         '#585858',
  '--green':         '#22c55e',
  '--green2':        '#16a34a',
  '--green-dim':     'rgba(34,197,94,0.08)',
  '--green-border':  'rgba(34,197,94,0.22)',
  '--green-glow':    'rgba(34,197,94,0.14)',
  '--red':           '#ef4444',
  '--red-dim':       'rgba(239,68,68,0.10)',
  '--amber':         '#f59e0b',
  '--amber-dim':     'rgba(245,158,11,0.10)',
  '--blue':          '#3b82f6',
  '--blue-dim':      'rgba(59,130,246,0.10)',
  '--sidebar-bg':    '#0c0c0c',
  '--nav-bg':        'rgba(8,8,8,0.92)',
  '--shadow':        'rgba(0,0,0,0.70)',
  '--grid':          'rgba(255,255,255,0.025)',
};

export const LIGHT_TOKENS: Record<string, string> = {
  '--bg':            '#f8f8f6',
  '--surface':       '#ffffff',
  '--surface2':      '#f2f2ef',
  '--surface3':      '#eaeae6',
  '--border':        '#e4e4e0',
  '--border2':       '#d0d0ca',
  '--text':          '#111111',
  '--text2':         '#545450',
  '--text3':         '#888880',
  '--green':         '#16a34a',
  '--green2':        '#15803d',
  '--green-dim':     'rgba(22,163,74,0.08)',
  '--green-border':  'rgba(22,163,74,0.22)',
  '--green-glow':    'rgba(22,163,74,0.10)',
  '--red':           '#dc2626',
  '--red-dim':       'rgba(220,38,38,0.10)',
  '--amber':         '#d97706',
  '--amber-dim':     'rgba(217,119,6,0.10)',
  '--blue':          '#2563eb',
  '--blue-dim':      'rgba(37,99,235,0.10)',
  '--sidebar-bg':    '#f0f0ee',
  '--nav-bg':        'rgba(248,248,246,0.92)',
  '--shadow':        'rgba(0,0,0,0.12)',
  '--grid':          'rgba(0,0,0,0.04)',
};

export function applyTokens(theme: ThemeKey): void {
  const tokens = theme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS;
  const root = document.documentElement;
  Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('data-theme', theme);
}

export function getStoredTheme(): ThemeKey {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('subsight-theme') as ThemeKey) || 'dark';
}

export function storeTheme(theme: ThemeKey): void {
  localStorage.setItem('subsight-theme', theme);
}
