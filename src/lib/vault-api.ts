import { fetchWithTimeout } from '@/lib/fetch-client'
import type { VaultItem, VaultSettings } from '@/lib/types'

export interface VaultPayload {
  items: VaultItem[]
  settings: VaultSettings
}

export interface VaultItemInput {
  name: string
  category: string
  amount: number
  currency: string
  purchaseDate: string
  notes?: string | null
}

async function parseApiError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data.error || `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

async function request(path: string, init?: RequestInit): Promise<void> {
  const res = await fetchWithTimeout(path, { ...init, timeoutMs: 15_000 })
  if (!res.ok) throw new Error(await parseApiError(res))
}

export async function fetchVault(): Promise<VaultPayload> {
  const res = await fetchWithTimeout('/api/vault', { timeoutMs: 15_000 })
  if (!res.ok) throw new Error(await parseApiError(res))
  return res.json() as Promise<VaultPayload>
}

export async function createVaultItem(item: VaultItemInput): Promise<void> {
  await request('/api/vault', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
}

export async function updateVaultItem(
  id: string,
  updates: Partial<VaultItemInput>,
): Promise<void> {
  await request('/api/vault', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  })
}

export async function deleteVaultItem(id: string): Promise<void> {
  await request(`/api/vault?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function saveVaultSettings(settings: VaultSettings): Promise<void> {
  await request('/api/vault', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
}
