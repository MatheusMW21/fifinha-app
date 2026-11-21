export type FifaVersion = 'fc22' | 'fc23' | 'fc24' | 'fc25' | 'fc26' | 'fc27'

export type RatingDiff = 'free' | 2 | 3 | 4

export interface League {
  id: string
  name: string
  nation: string
}

export interface Team {
  id: string
  name: string
  shortName: string
  overall: number
  leagueId: string
  league: string
  nation: string
}

export interface TeamsData {
  version: FifaVersion
  generatedAt: string
  leagues: League[]
  teams: Team[]
}

export interface DrawResult {
  team1: Team
  team2: Team
  version: FifaVersion
  timestamp: number
}

export interface TournamentState {
  active: boolean
  round: number
  usedTeamIds: string[]
  rounds: DrawResult[]
  version: FifaVersion
  competition: 'champions-league'
}

export const FIFA_VERSIONS: { value: FifaVersion; label: string }[] = [
  { value: 'fc22', label: 'FC 22' },
  { value: 'fc23', label: 'FC 23' },
  { value: 'fc24', label: 'FC 24' },
  { value: 'fc25', label: 'FC 25' },
  { value: 'fc26', label: 'FC 26' },
  { value: 'fc27', label: 'FC 27' },
]

export const RATING_DIFF_OPTIONS: { value: RatingDiff; label: string }[] = [
  { value: 'free', label: 'Livre' },
  { value: 2, label: '2 pts' },
  { value: 3, label: '3 pts' },
  { value: 4, label: '4 pts' },
]
