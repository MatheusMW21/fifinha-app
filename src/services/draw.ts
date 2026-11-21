import { Team, RatingDiff, DrawResult, FifaVersion } from '../types'

export type DrawError = 'NO_DATA' | 'EMPTY_POOL' | 'NO_VALID_PAIR'

export type DrawOutcome =
  | { ok: true; result: DrawResult }
  | { ok: false; error: DrawError }

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function drawTeams(
  allTeams: Team[],
  selectedLeagueIds: string[] | null,
  ratingDiff: RatingDiff,
  version: FifaVersion,
  excludeIds?: string[],
): DrawOutcome {
  if (allTeams.length === 0) {
    return { ok: false, error: 'NO_DATA' }
  }

  let pool = selectedLeagueIds
    ? allTeams.filter((t) => selectedLeagueIds.includes(t.leagueId))
    : allTeams
    
  if (excludeIds?.length) {
    pool = pool.filter((t) => !excludeIds.includes(t.id))
  }

  if (pool.length < 2) {
    return { ok: false, error: 'EMPTY_POOL' }
  }


  if (ratingDiff === 'free') {
    const team1 = pickRandom(pool)
    const team2 = pickRandom(pool.filter((t) => t.id !== team1.id))
    return { ok: true, result: { team1, team2, version, timestamp: Date.now() } }
  }

  // Shuffle first so the "first valid pair" isn't always biased toward high-rated teams
  const shuffled = [...pool].sort(() => Math.random() - 0.5)

  for (const team1 of shuffled) {
    const candidates = pool.filter(
      (t) => t.id !== team1.id && Math.abs(t.overall - team1.overall) <= ratingDiff,
    )
    if (candidates.length > 0) {
      const team2 = pickRandom(candidates)
      return { ok: true, result: { team1, team2, version, timestamp: Date.now() } }
    }
  }

  return { ok: false, error: 'NO_VALID_PAIR' }
}
