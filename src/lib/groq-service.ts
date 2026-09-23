import Groq, {
  APIError,
  APIConnectionError,
  APIConnectionTimeoutError,
  InternalServerError,
  RateLimitError,
} from 'groq-sdk'
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat'
import { escapeHtml, sanitizeText } from './validation'
import { logError } from './error-logger'

// Preferred model IDs are tried in order. The first model in each list is the
// one the app intentionally uses today; the remaining entries are compatibility
// fallbacks selected from the models Groq reports as available.
const MODEL_PREFERENCES = {
  fast: [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'llama3-70b-8192',
    'llama3-8b-8192',
  ],
  quality: [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama3-70b-8192',
    'llama-3.1-8b-instant',
  ],
} as const

type ModelKey = keyof typeof MODEL_PREFERENCES

// Model IDs that are not usable for chat completions.
const NON_CHAT_MODELS = new Set([
  'text-embedding-3-large',
  'text-embedding-3-small',
  'whisper-large-v3',
  'whisper-large-v3-turbo',
])

const MODEL_CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours
const GROQ_TIMEOUT_MS = 40_000
const MAX_RETRIES = 3
const MAX_BACKOFF_MS = 10_000

interface ChatCompletionRequest {
  modelKey: ModelKey
  messages: ChatCompletionMessageParam[]
  maxTokens: number
  temperature: number
}

let modelsCache: { models: string[]; fetchedAt: number } | null = null
let inflightModelsFetch: Promise<string[]> | null = null

// ── Subscription pricing knowledge base ─────────────────────────────────────
// A curated, regularly-updated map of well-known services and their real
// current pricing. This is the primary source the LLM is used as a fallback
// and for services not in the map.
const KNOWN_SUBSCRIPTIONS: Record<
  string,
  {
    provider: string
    category: string
    amount: number
    currency: string
    billingCycle: string
    autoRenew: boolean
  }
> = {
  // ── Streaming / Entertainment ─────────────────────────────────────────────
  netflix: { provider: 'Netflix', category: 'Entertainment', amount: 15.49, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'netflix standard': { provider: 'Netflix', category: 'Entertainment', amount: 15.49, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'netflix premium': { provider: 'Netflix', category: 'Entertainment', amount: 22.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'netflix basic': { provider: 'Netflix', category: 'Entertainment', amount: 7.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  hulu: { provider: 'Hulu', category: 'Entertainment', amount: 7.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'disney+': { provider: 'Disney+', category: 'Entertainment', amount: 13.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'disney plus': { provider: 'Disney+', category: 'Entertainment', amount: 13.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'hbo max': { provider: 'Max (HBO)', category: 'Entertainment', amount: 15.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  max: { provider: 'Max (HBO)', category: 'Entertainment', amount: 15.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'amazon prime': { provider: 'Amazon', category: 'Entertainment', amount: 14.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'amazon prime video': { provider: 'Amazon Prime Video', category: 'Entertainment', amount: 8.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'prime video': { provider: 'Amazon Prime Video', category: 'Entertainment', amount: 8.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'apple tv+': { provider: 'Apple', category: 'Entertainment', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'apple tv plus': { provider: 'Apple', category: 'Entertainment', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  peacock: { provider: 'NBCUniversal', category: 'Entertainment', amount: 7.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  paramount: { provider: 'Paramount+', category: 'Entertainment', amount: 7.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'paramount+': { provider: 'Paramount+', category: 'Entertainment', amount: 7.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  crunchyroll: { provider: 'Crunchyroll', category: 'Entertainment', amount: 7.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  funimation: { provider: 'Funimation', category: 'Entertainment', amount: 7.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  discovery: { provider: 'Discovery+', category: 'Entertainment', amount: 4.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'discovery+': { provider: 'Discovery+', category: 'Entertainment', amount: 4.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  mubi: { provider: 'MUBI', category: 'Entertainment', amount: 12.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  criterion: { provider: 'Criterion Channel', category: 'Entertainment', amount: 10.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  shudder: { provider: 'Shudder', category: 'Entertainment', amount: 6.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  plex: { provider: 'Plex', category: 'Entertainment', amount: 4.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  twitch: { provider: 'Twitch', category: 'Entertainment', amount: 4.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Music ─────────────────────────────────────────────────────────────────
  spotify: { provider: 'Spotify', category: 'Entertainment', amount: 11.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'spotify premium': { provider: 'Spotify', category: 'Entertainment', amount: 11.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'apple music': { provider: 'Apple', category: 'Entertainment', amount: 10.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'youtube music': { provider: 'Google', category: 'Entertainment', amount: 10.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  tidal: { provider: 'TIDAL', category: 'Entertainment', amount: 10.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  deezer: { provider: 'Deezer', category: 'Entertainment', amount: 10.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'amazon music': { provider: 'Amazon', category: 'Entertainment', amount: 10.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  pandora: { provider: 'Pandora', category: 'Entertainment', amount: 4.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  soundcloud: { provider: 'SoundCloud', category: 'Entertainment', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Productivity & Office ─────────────────────────────────────────────────
  'microsoft 365': { provider: 'Microsoft', category: 'Productivity', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'microsoft office': { provider: 'Microsoft', category: 'Productivity', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'office 365': { provider: 'Microsoft', category: 'Productivity', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'google workspace': { provider: 'Google', category: 'Productivity', amount: 12.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'google one': { provider: 'Google', category: 'Cloud', amount: 2.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  notion: { provider: 'Notion Labs', category: 'Productivity', amount: 16.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'notion plus': { provider: 'Notion Labs', category: 'Productivity', amount: 16.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  evernote: { provider: 'Evernote', category: 'Productivity', amount: 14.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  todoist: { provider: 'Doist', category: 'Productivity', amount: 4.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'todoist pro': { provider: 'Doist', category: 'Productivity', amount: 4.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  clickup: { provider: 'ClickUp', category: 'Productivity', amount: 7.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  asana: { provider: 'Asana', category: 'Productivity', amount: 13.49, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  monday: { provider: 'Monday.com', category: 'Productivity', amount: 9.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'monday.com': { provider: 'Monday.com', category: 'Productivity', amount: 9.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  trello: { provider: 'Atlassian', category: 'Productivity', amount: 5.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  jira: { provider: 'Atlassian', category: 'Development', amount: 7.75, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  confluence: { provider: 'Atlassian', category: 'Productivity', amount: 5.75, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  linear: { provider: 'Linear', category: 'Development', amount: 8.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'linear plus': { provider: 'Linear', category: 'Development', amount: 8.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  basecamp: { provider: 'Basecamp', category: 'Productivity', amount: 15.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  airtable: { provider: 'Airtable', category: 'Productivity', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  coda: { provider: 'Coda', category: 'Productivity', amount: 12.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  obsidian: { provider: 'Obsidian', category: 'Productivity', amount: 8.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Cloud Storage ─────────────────────────────────────────────────────────
  dropbox: { provider: 'Dropbox', category: 'Cloud', amount: 11.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'dropbox plus': { provider: 'Dropbox', category: 'Cloud', amount: 11.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  icloud: { provider: 'Apple', category: 'Cloud', amount: 2.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'icloud+': { provider: 'Apple', category: 'Cloud', amount: 2.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  box: { provider: 'Box', category: 'Cloud', amount: 10.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  onedrive: { provider: 'Microsoft', category: 'Cloud', amount: 1.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'backblaze b2': { provider: 'Backblaze', category: 'Cloud', amount: 7.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  backblaze: { provider: 'Backblaze', category: 'Cloud', amount: 9.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Developer Tools ───────────────────────────────────────────────────────
  github: { provider: 'GitHub', category: 'Development', amount: 4.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'github pro': { provider: 'GitHub', category: 'Development', amount: 4.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'github copilot': { provider: 'GitHub', category: 'Development', amount: 10.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  gitlab: { provider: 'GitLab', category: 'Development', amount: 29.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  vercel: { provider: 'Vercel', category: 'Development', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'vercel pro': { provider: 'Vercel', category: 'Development', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  netlify: { provider: 'Netlify', category: 'Development', amount: 19.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  heroku: { provider: 'Heroku', category: 'Development', amount: 5.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  railway: { provider: 'Railway', category: 'Development', amount: 5.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  render: { provider: 'Render', category: 'Development', amount: 7.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  digitalocean: { provider: 'DigitalOcean', category: 'Cloud', amount: 6.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  linode: { provider: 'Akamai (Linode)', category: 'Cloud', amount: 5.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  datadog: { provider: 'Datadog', category: 'Development', amount: 15.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  sentry: { provider: 'Sentry', category: 'Development', amount: 26.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  postman: { provider: 'Postman', category: 'Development', amount: 14.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'jetbrains all products': { provider: 'JetBrains', category: 'Development', amount: 28.90, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  jetbrains: { provider: 'JetBrains', category: 'Development', amount: 28.90, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  cursor: { provider: 'Anysphere', category: 'Development', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'cursor pro': { provider: 'Anysphere', category: 'Development', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  replit: { provider: 'Replit', category: 'Development', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  supabase: { provider: 'Supabase', category: 'Development', amount: 25.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'supabase pro': { provider: 'Supabase', category: 'Development', amount: 25.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  planetscale: { provider: 'PlanetScale', category: 'Development', amount: 39.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  neon: { provider: 'Neon', category: 'Development', amount: 19.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  turso: { provider: 'Turso', category: 'Development', amount: 29.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  cloudflare: { provider: 'Cloudflare', category: 'Development', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'cloudflare pro': { provider: 'Cloudflare', category: 'Development', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── AI & LLM Tools ────────────────────────────────────────────────────────
  chatgpt: { provider: 'OpenAI', category: 'Productivity', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'chatgpt plus': { provider: 'OpenAI', category: 'Productivity', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'chatgpt pro': { provider: 'OpenAI', category: 'Productivity', amount: 200.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  claude: { provider: 'Anthropic', category: 'Productivity', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'claude pro': { provider: 'Anthropic', category: 'Productivity', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  gemini: { provider: 'Google', category: 'Productivity', amount: 19.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'gemini advanced': { provider: 'Google', category: 'Productivity', amount: 19.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  perplexity: { provider: 'Perplexity AI', category: 'Productivity', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'perplexity pro': { provider: 'Perplexity AI', category: 'Productivity', amount: 20.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  midjourney: { provider: 'Midjourney', category: 'Design', amount: 10.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'midjourney basic': { provider: 'Midjourney', category: 'Design', amount: 10.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'midjourney standard': { provider: 'Midjourney', category: 'Design', amount: 30.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'midjourney pro': { provider: 'Midjourney', category: 'Design', amount: 60.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  runway: { provider: 'Runway', category: 'Design', amount: 15.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'runway standard': { provider: 'Runway', category: 'Design', amount: 15.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  elevenlabs: { provider: 'ElevenLabs', category: 'Other', amount: 5.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'elevenlabs starter': { provider: 'ElevenLabs', category: 'Other', amount: 5.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  kiro: { provider: 'AWS / Kiro', category: 'Development', amount: 19.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Design ────────────────────────────────────────────────────────────────
  figma: { provider: 'Figma', category: 'Design', amount: 15.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'figma professional': { provider: 'Figma', category: 'Design', amount: 15.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  sketch: { provider: 'Sketch', category: 'Design', amount: 10.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  canva: { provider: 'Canva', category: 'Design', amount: 14.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'canva pro': { provider: 'Canva', category: 'Design', amount: 14.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  framer: { provider: 'Framer', category: 'Design', amount: 15.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'adobe creative cloud': { provider: 'Adobe', category: 'Design', amount: 54.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  adobe: { provider: 'Adobe', category: 'Design', amount: 54.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'adobe photoshop': { provider: 'Adobe', category: 'Design', amount: 22.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  photoshop: { provider: 'Adobe', category: 'Design', amount: 22.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'adobe illustrator': { provider: 'Adobe', category: 'Design', amount: 22.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  illustrator: { provider: 'Adobe', category: 'Design', amount: 22.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'adobe premiere': { provider: 'Adobe', category: 'Design', amount: 22.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  lottiefiles: { provider: 'LottieFiles', category: 'Design', amount: 14.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Communication ─────────────────────────────────────────────────────────
  slack: { provider: 'Slack', category: 'Communication', amount: 7.25, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'slack pro': { provider: 'Slack', category: 'Communication', amount: 7.25, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  discord: { provider: 'Discord', category: 'Communication', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'discord nitro': { provider: 'Discord', category: 'Communication', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  zoom: { provider: 'Zoom', category: 'Communication', amount: 15.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'zoom pro': { provider: 'Zoom', category: 'Communication', amount: 15.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  loom: { provider: 'Loom', category: 'Communication', amount: 15.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  intercom: { provider: 'Intercom', category: 'Communication', amount: 74.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  helpscout: { provider: 'Help Scout', category: 'Communication', amount: 22.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Marketing & Analytics ─────────────────────────────────────────────────
  mailchimp: { provider: 'Mailchimp', category: 'Marketing', amount: 13.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'mailchimp essentials': { provider: 'Mailchimp', category: 'Marketing', amount: 13.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  sendgrid: { provider: 'Twilio SendGrid', category: 'Marketing', amount: 19.95, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  convertkit: { provider: 'ConvertKit', category: 'Marketing', amount: 25.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'kit (convertkit)': { provider: 'ConvertKit', category: 'Marketing', amount: 25.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  hubspot: { provider: 'HubSpot', category: 'Marketing', amount: 50.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'hubspot starter': { provider: 'HubSpot', category: 'Marketing', amount: 50.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  semrush: { provider: 'Semrush', category: 'Marketing', amount: 139.95, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  ahrefs: { provider: 'Ahrefs', category: 'Marketing', amount: 99.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Finance ───────────────────────────────────────────────────────────────
  quickbooks: { provider: 'Intuit', category: 'Finance', amount: 30.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'quickbooks online': { provider: 'Intuit', category: 'Finance', amount: 30.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  xero: { provider: 'Xero', category: 'Finance', amount: 15.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  freshbooks: { provider: 'FreshBooks', category: 'Finance', amount: 17.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  stripe: { provider: 'Stripe', category: 'Finance', amount: 0.00, currency: 'USD', billingCycle: 'monthly', autoRenew: false },
  'you need a budget': { provider: 'YNAB', category: 'Finance', amount: 14.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  ynab: { provider: 'YNAB', category: 'Finance', amount: 14.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Education ─────────────────────────────────────────────────────────────
  coursera: { provider: 'Coursera', category: 'Education', amount: 59.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'coursera plus': { provider: 'Coursera', category: 'Education', amount: 59.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  udemy: { provider: 'Udemy', category: 'Education', amount: 16.58, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  linkedin: { provider: 'LinkedIn', category: 'Education', amount: 29.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'linkedin premium': { provider: 'LinkedIn', category: 'Education', amount: 39.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'linkedin learning': { provider: 'LinkedIn', category: 'Education', amount: 29.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  duolingo: { provider: 'Duolingo', category: 'Education', amount: 6.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'duolingo plus': { provider: 'Duolingo', category: 'Education', amount: 6.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  skillshare: { provider: 'Skillshare', category: 'Education', amount: 14.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  brilliant: { provider: 'Brilliant', category: 'Education', amount: 24.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Health & Fitness ─────────────────────────────────────────────────────
  calm: { provider: 'Calm', category: 'Health', amount: 14.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  headspace: { provider: 'Headspace', category: 'Health', amount: 12.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  peloton: { provider: 'Peloton', category: 'Health', amount: 44.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'peloton app': { provider: 'Peloton', category: 'Health', amount: 12.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  noom: { provider: 'Noom', category: 'Health', amount: 70.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  strava: { provider: 'Strava', category: 'Health', amount: 11.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  whoop: { provider: 'WHOOP', category: 'Health', amount: 30.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Password Managers & Security ─────────────────────────────────────────
  '1password': { provider: '1Password', category: 'Other', amount: 2.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  lastpass: { provider: 'LastPass', category: 'Other', amount: 3.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  bitwarden: { provider: 'Bitwarden', category: 'Other', amount: 1.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  nordpass: { provider: 'Nord Security', category: 'Other', amount: 1.49, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  nordvpn: { provider: 'Nord Security', category: 'Other', amount: 3.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  expressvpn: { provider: 'ExpressVPN', category: 'Other', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  protonvpn: { provider: 'Proton', category: 'Other', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'proton mail': { provider: 'Proton', category: 'Communication', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  protonmail: { provider: 'Proton', category: 'Communication', amount: 9.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  mullvad: { provider: 'Mullvad', category: 'Other', amount: 5.00, currency: 'USD', billingCycle: 'monthly', autoRenew: true },

  // ── Gaming ────────────────────────────────────────────────────────────────
  'xbox game pass': { provider: 'Microsoft', category: 'Entertainment', amount: 14.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'xbox game pass ultimate': { provider: 'Microsoft', category: 'Entertainment', amount: 19.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'playstation plus': { provider: 'Sony', category: 'Entertainment', amount: 14.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'ps plus': { provider: 'Sony', category: 'Entertainment', amount: 14.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'nintendo online': { provider: 'Nintendo', category: 'Entertainment', amount: 3.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  'ea play': { provider: 'EA', category: 'Entertainment', amount: 4.99, currency: 'USD', billingCycle: 'monthly', autoRenew: true },
  steam: { provider: 'Valve', category: 'Entertainment', amount: 0.00, currency: 'USD', billingCycle: 'one-time', autoRenew: false },
}

function lookupKnownSubscription(name: string) {
  const key = name.trim().toLowerCase()
  if (KNOWN_SUBSCRIPTIONS[key]) return KNOWN_SUBSCRIPTIONS[key]
  // Fuzzy: find the longest known key that is fully contained in the input
  let best: (typeof KNOWN_SUBSCRIPTIONS)[string] | null = null
  let bestLen = 0
  for (const [k, v] of Object.entries(KNOWN_SUBSCRIPTIONS)) {
    if (key.includes(k) && k.length > bestLen) {
      best = v
      bestLen = k.length
    }
  }
  return best
}

// ── JSON parsing helpers ─────────────────────────────────────────────────────

function parseAIJson(text: string): Record<string, unknown> {
  const trimmed = text.trim()
  // Strip markdown fences if present
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = fenceMatch?.[1]?.trim() ?? trimmed
  // Extract the first {...} block in case the model adds extra prose
  const objMatch = jsonStr.match(/\{[\s\S]*\}/)
  return JSON.parse(objMatch?.[0] ?? jsonStr) as Record<string, unknown>
}

// ── Groq client helpers ───────────────────────────────────────────────────────

function getGroq(): Groq {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')
  // Retries are handled explicitly below; SDK retries are disabled for
  // predictable behaviour and testability.
  return new Groq({ apiKey, maxRetries: 0, timeout: GROQ_TIMEOUT_MS })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function backoffDelay(attempt: number, retryAfterMs?: number): number {
  if (retryAfterMs != null) return retryAfterMs
  const exponential = 600 * 2 ** attempt
  const jitter = Math.round(Math.random() * 300)
  return Math.min(exponential + jitter, MAX_BACKOFF_MS)
}

function parseRetryAfter(headers?: Headers): number | undefined {
  const value = headers?.get('retry-after')
  if (!value) return undefined
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds < 0) return undefined
  return Math.min(seconds * 1000, MAX_BACKOFF_MS)
}

function isRateLimitError(err: unknown): err is RateLimitError {
  return err instanceof RateLimitError
}

function isTransientError(err: unknown): boolean {
  return (
    err instanceof APIConnectionError ||
    err instanceof APIConnectionTimeoutError ||
    err instanceof InternalServerError
  )
}

function isModelUnavailableError(err: unknown): boolean {
  if (!(err instanceof APIError)) return false
  if (err.status === 404) return true
  if (err.status !== 400) return false
  const message = err.message.toLowerCase()
  return message.includes('model_not_found') || message.includes('model not found')
}

async function fetchModelIds(groq: Groq): Promise<string[]> {
  const response = await groq.models.list()
  return (response.data ?? []).map((m) => m.id).filter((id) => !NON_CHAT_MODELS.has(id))
}

async function getModels(groq: Groq, options: { force?: boolean } = {}): Promise<string[]> {
  const now = Date.now()
  if (!options.force && modelsCache && now - modelsCache.fetchedAt < MODEL_CACHE_TTL_MS) {
    return modelsCache.models
  }
  if (!inflightModelsFetch) {
    inflightModelsFetch = fetchModelIds(groq)
      .then((models) => {
        modelsCache = { models, fetchedAt: Date.now() }
        return models
      })
      .finally(() => { inflightModelsFetch = null })
  }
  try {
    return await inflightModelsFetch
  } catch (err) {
    if (modelsCache) return modelsCache.models
    throw err
  }
}

function selectModel(
  models: string[],
  preference: readonly string[],
  exclude: Set<string>,
): string | null {
  for (const id of preference) {
    if (!exclude.has(id) && models.includes(id)) return id
  }
  return models.find((id) => !exclude.has(id)) ?? null
}

async function chatCompletion(groq: Groq, request: ChatCompletionRequest) {
  const preference = MODEL_PREFERENCES[request.modelKey]
  const triedModels = new Set<string>()

  let models: string[] = []
  try {
    models = await getModels(groq)
  } catch (err) {
    logError(err, { context: 'groq-model-discovery' })
  }

  let model =
    selectModel(models, preference, triedModels) ??
    preference.find((id) => !triedModels.has(id)) ??
    null
  if (!model) throw new Error('No suitable Groq model available')

  let attempt = 0

  for (;;) {
    triedModels.add(model)
    try {
      return await groq.chat.completions.create({
        model,
        messages: request.messages,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
      })
    } catch (err) {
      if (isModelUnavailableError(err)) {
        let refreshed = models
        try {
          refreshed = await getModels(groq, { force: true })
        } catch (refreshErr) {
          logError(refreshErr, { context: 'groq-model-refresh' })
          refreshed = [...preference]
        }
        const next = selectModel(refreshed, preference, triedModels)
        if (!next) {
          logError(err, { context: 'groq-model-fallback', model })
          throw new Error('Groq model unavailable')
        }
        model = next
        continue
      }

      const shouldRetry = isRateLimitError(err) || isTransientError(err)
      if (!shouldRetry || attempt >= MAX_RETRIES) throw err
      const retryAfterMs = isRateLimitError(err) ? parseRetryAfter(err.headers) : undefined
      await sleep(backoffDelay(attempt, retryAfterMs))
      attempt += 1
    }
  }
}

// ── Public AI functions ───────────────────────────────────────────────────────

/**
 * Auto-fill subscription details for a given service name.
 *
 * Strategy:
 * 1. Check the curated KNOWN_SUBSCRIPTIONS map first instant, accurate, no AI cost.
 * 2. Fall back to Groq LLM for unknown services, with a highly-specific prompt
 *    that instructs the model to use its training data for real current pricing.
 */
export async function autoFillSubscription(name: string): Promise<{
  provider: string
  category: string
  amount: number
  currency: string
  billingCycle: string
  autoRenew: boolean
}> {
  // ── 1. Fast path: curated knowledge base ──────────────────────────────────
  const known = lookupKnownSubscription(name)
  if (known) return known

  // ── 2. Slow path: LLM with a highly-specific, factual prompt ──────────────
  const groq = getGroq()
  const response = await chatCompletion(groq, {
    modelKey: 'fast',
    messages: [
      {
        role: 'system',
        content: `You are a real-time subscription pricing database.
Your ONLY job is to return factual, current pricing for subscription services.

Rules:
- Use your knowledge of ACTUAL current pricing from the service's official website.
- For the "amount" field, return the most widely-used individual/personal plan price in USD.
- If the service is free at the base level, return 0.
- If the service doesn't exist or you are uncertain, still return your best estimate.
- Return ONLY valid JSON no markdown, no explanation, no extra text whatsoever.

Required JSON shape (ALL fields mandatory):
{
  "provider": "Official company or brand name (string)",
  "category": "One of: Entertainment | Productivity | Development | Design | Marketing | Finance | Health | Education | Cloud | Communication | Other",
  "amount": <number USD monthly price, e.g. 9.99>,
  "currency": "USD",
  "billingCycle": "monthly | annually | one-time",
  "autoRenew": <true | false>
}

Pricing accuracy tips:
- Netflix Standard = $15.49/mo, Spotify Premium = $11.99/mo, ChatGPT Plus = $20/mo
- GitHub Copilot = $10/mo, Vercel Pro = $20/mo, Figma Pro = $15/mo
- Use the monthly individual plan; do not use annual or team pricing unless the service is annual-only.`,
      },
      {
        role: 'user',
        content: `Service name: "${name}"

Return the JSON object with real current pricing for this subscription.`,
      },
    ],
    maxTokens: 300,
    temperature: 0.05,
  })

  const text = response.choices[0]?.message?.content || '{}'
  try {
    const parsed = parseAIJson(text)
    const aiBillingCycle = String(parsed.billingCycle || 'monthly').toLowerCase()
    // Normalise "yearly" ➜ "annually" to match app's billing cycle values
    const normalizedBillingCycle =
      aiBillingCycle === 'yearly' || aiBillingCycle === 'annual' ? 'annually' : aiBillingCycle
    return {
      provider: escapeHtml(String(parsed.provider || '')).slice(0, 100),
      category: escapeHtml(String(parsed.category || 'Other')).slice(0, 50),
      amount: Math.min(Math.abs(Number(parsed.amount) || 0), 999999),
      currency: escapeHtml(String(parsed.currency || 'USD')).slice(0, 10),
      billingCycle: escapeHtml(normalizedBillingCycle).slice(0, 20),
      autoRenew: Boolean(parsed.autoRenew),
    }
  } catch {
    throw new Error('Failed to parse AI response')
  }
}

/**
 * Generate a detailed, personalised spending analysis for the user's active
 * subscriptions. Uses the quality model with an upgraded prompt that produces
 * richer, more actionable advice.
 */
export async function summarizeSpending(
  subscriptions: {
    name: string
    amount: number
    billingCycle: string
    category: string
  }[],
): Promise<string> {
  const groq = getGroq()

  // Pre-compute key figures to include in the prompt so the model doesn't
  // have to derive them and can focus on analysis quality.
  const totalMonthly = subscriptions.reduce((sum, s) => {
    const monthly =
      s.billingCycle === 'annually' || s.billingCycle === 'yearly'
        ? s.amount / 12
        : s.billingCycle === 'weekly'
          ? s.amount * 4.33
          : s.amount
    return sum + monthly
  }, 0)
  const annualProjected = totalMonthly * 12
  const categoryBreakdown = subscriptions.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + s.amount
    return acc
  }, {})
  const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''

  const response = await chatCompletion(groq, {
    modelKey: 'quality',
    messages: [
      {
        role: 'system',
        content: `You are an expert personal finance advisor specialising in subscription optimisation.
You analyse a user's subscription portfolio and deliver clear, specific, and genuinely useful advice.

Your analysis must cover ALL of the following in 4 to 5 paragraphs:
1. **Spending overview** total monthly cost, annual projection, and what this means in context (e.g. compare to average American spending on subscriptions which is ~$219/mo).
2. **Category breakdown** which categories dominate the spend and whether that reflects the user's likely priorities.
3. **Overlap & redundancy** identify any duplicate or overlapping services (e.g. two streaming services, two cloud storage tools, two note-taking apps) and name them specifically.
4. **Cost optimisation** suggest specific actions: services to cancel, annual billing switches (annual is typically 15-20% cheaper), or cheaper alternatives. Quote real current prices where possible.
5. **Action priority** end with a clear "top 3 actions" the user should take this week, in priority order.

Formatting rules:
- Use **bold** (double asterisks) ONLY for key figures, service names, and section labels.
- Write in flowing paragraphs no bullet lists, no markdown headers, no numbered lists (except the final "top 3 actions" which should be numbered inline within prose).
- Be direct, specific, and opinionated. Generic advice like "consider cancelling unused subscriptions" is not acceptable name the actual services.
- Tone: professional but approachable, like a trusted financial advisor.`,
      },
      {
        role: 'user',
        content: `Here is my current subscription portfolio:

${JSON.stringify(subscriptions, null, 2)}

Pre-computed figures for your reference:
- Estimated monthly total: $${totalMonthly.toFixed(2)}
- Estimated annual projection: $${annualProjected.toFixed(0)}
- Top spending category: ${topCategory}
- Number of subscriptions: ${subscriptions.length}

Please provide a thorough, personalised analysis with specific actionable recommendations.`,
      },
    ],
    maxTokens: 900,
    temperature: 0.6,
  })

  const raw = response.choices[0]?.message?.content || 'Unable to generate summary.'
  return sanitizeText(raw).slice(0, 8000)
}
