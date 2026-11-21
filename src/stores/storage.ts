/**
 * Storage adapter for Zustand persist middleware.
 *
 * @react-native-async-storage/async-storage v2 requires a native build and
 * throws when the native module is null (e.g. Expo Go). This adapter catches
 * that error and falls back to an in-memory Map so the app works in both
 * Expo Go (state resets on close) and production builds (state persists).
 */
import { StateStorage } from 'zustand/middleware'

const mem = new Map<string, string>()

async function getStorage() {
  try {
    const { default: AS } = await import('@react-native-async-storage/async-storage')
    // Probe to verify native module is actually available
    await AS.getItem('__probe__')
    return AS
  } catch {
    return null
  }
}

export const safeStorage: StateStorage = {
  getItem: async (key) => {
    const s = await getStorage()
    if (s) {
      try { return await s.getItem(key) } catch { /* fall through */ }
    }
    return mem.get(key) ?? null
  },
  setItem: async (key, value) => {
    const s = await getStorage()
    if (s) {
      try { await s.setItem(key, value); return } catch { /* fall through */ }
    }
    mem.set(key, value)
  },
  removeItem: async (key) => {
    const s = await getStorage()
    if (s) {
      try { await s.removeItem(key); return } catch { /* fall through */ }
    }
    mem.delete(key)
  },
}
