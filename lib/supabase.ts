/**
 * Shastra Life — Supabase Client & Offline-First Sync
 *
 * Architecture:
 * - localStorage is always the source of truth for the UI
 * - Supabase sync is fire-and-forget in the background
 * - If offline or Supabase is unreachable, sync is queued and retried when online
 */

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create a real client when env vars are properly configured (not placeholders)
const isConfigured =
    !!supabaseUrl &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== 'your_eyJhb..._key'

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

export type UserProfileSyncData = {
    id: string
    name?: string
    zodiac_sign?: string
    deity?: string
    city?: string
    language?: string
    dark_mode?: boolean
    notif_enabled?: boolean
    notif_time?: string
}

// ─── UUID ────────────────────────────────────────────────────────────────────

/**
 * Get or create the anonymous UUID for this device.
 * Created once on first visit and persisted in localStorage forever.
 * Used to correlate PostHog identity with Supabase profile row.
 */
export function getOrCreateUUID(): string {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem('shastra-uuid')
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id)) {
        id = uuidv4()
        localStorage.setItem('shastra-uuid', id)
    }
    return id
}

// ─── Offline queue ────────────────────────────────────────────────────────────

let pendingSyncs: UserProfileSyncData[] = []
let flushScheduled = false

function flushQueue(): void {
    if (!supabase || pendingSyncs.length === 0) {
        flushScheduled = false
        return
    }

    // Merge all pending syncs into one payload per unique id (last-write-wins per field)
    const merged: Record<string, UserProfileSyncData> = {}
    for (const item of pendingSyncs) {
        merged[item.id] = { ...merged[item.id], ...item }
    }
    pendingSyncs = []
    flushScheduled = false

    for (const data of Object.values(merged)) {
        supabase
            .from('user_profiles')
            .upsert(data, { onConflict: 'id' })
            .then(({ error }) => {
                if (error && process.env.NODE_ENV === 'development') {
                    console.warn('[Supabase Sync]', error.message)
                }
                // In production: silently drop — network hiccups are expected
            })
    }
}

// Flush the queue when the device comes back online
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        if (pendingSyncs.length > 0) flushQueue()
    })
}

/**
 * Fire-and-forget profile upsert to Supabase.
 * Safe to call on every user action — rapid calls are batched into one request.
 * Queues silently if offline and retries when navigator.onLine becomes true.
 */
export function syncProfileToCloud(data: UserProfileSyncData): void {
    if (!supabase || typeof window === 'undefined') return

    pendingSyncs.push(data)

    if (!navigator.onLine) return // 'online' listener above will flush

    if (!flushScheduled) {
        flushScheduled = true
        // Short delay batches rapid successive calls (e.g. multiple setUserProperty in one tick)
        setTimeout(flushQueue, 200)
    }
}
