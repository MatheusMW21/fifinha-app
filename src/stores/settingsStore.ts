import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { FifaVersion, RatingDiff } from '../types'
import { safeStorage } from './storage'

interface SettingsState {
  ratingDiff: RatingDiff
  playerNames: { p1: string; p2: string }
  leagueFilters: Partial<Record<FifaVersion, string[] | null>>
}

interface SettingsActions {
  setRatingDiff: (diff: RatingDiff) => void
  setPlayerName: (player: 'p1' | 'p2', name: string) => void
  setLeagueFilter: (version: FifaVersion, leagueIds: string[] | null) => void
  getLeagueFilter: (version: FifaVersion) => string[] | null
}

const defaults: SettingsState = {
  ratingDiff: 'free',
  playerNames: { p1: 'Jogador 1', p2: 'Jogador 2' },
  leagueFilters: {},
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      ...defaults,
      setRatingDiff: (ratingDiff) => set({ ratingDiff }),
      setPlayerName: (player, name) =>
        set((state) => ({
          playerNames: { ...state.playerNames, [player]: name },
        })),
      setLeagueFilter: (version, leagueIds) =>
        set((state) => ({
          leagueFilters: { ...state.leagueFilters, [version]: leagueIds },
        })),
      // Returns null if no filter stored for this version (means: all leagues)
      getLeagueFilter: (version) => get().leagueFilters[version] ?? null,
    }),
    {
      name: 'fifinha-settings-v1',
      storage: createJSONStorage(() => safeStorage),
    },
  ),
)
