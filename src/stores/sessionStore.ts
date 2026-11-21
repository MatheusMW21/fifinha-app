import { create } from 'zustand'
import { FifaVersion, DrawResult, TournamentState } from '../types'

interface SessionState {
  selectedVersion: FifaVersion | null
  currentResult: DrawResult | null
  history: DrawResult[]
  tournament: TournamentState | null
}

interface SessionActions {
  setVersion: (version: FifaVersion) => void
  setCurrentResult: (result: DrawResult) => void
  clearSession: () => void
  startTournament: (version: FifaVersion, competition: 'champions-league') => void
  endTournament: () => void
  advanceTournamentRound: (result: DrawResult) => void
}

export const useSessionStore = create<SessionState & SessionActions>()((set) => ({
  selectedVersion: null,
  currentResult: null,
  history: [],
  tournament: null,

  setVersion: (selectedVersion) => set({ selectedVersion }),

  setCurrentResult: (result) =>
    set((state) => ({
      currentResult: result,
      history: [result, ...state.history].slice(0, 50),
    })),

  clearSession: () =>
    set({ selectedVersion: null, currentResult: null, history: [] }),

  startTournament: (version, competition) =>
    set({ tournament: { active: true, round: 1, usedTeamIds: [], rounds: [], version, competition } }),

  endTournament: () => set({ tournament: null }),

  advanceTournamentRound: (result) =>
    set((state) => {
      if (!state.tournament) return {}
      return {
        tournament: {
          ...state.tournament,
          round: state.tournament.round + 1,
          usedTeamIds: [...state.tournament.usedTeamIds, result.team1.id, result.team2.id],
          rounds: [...state.tournament.rounds, result],
        },
      }
    }),
}))
