// scripts/transform-kaggle.mjs
//
// Transforms a Kaggle FIFA CSV into the teams JSON schema used by the app.
//
// Usage:
//   node scripts/transform-kaggle.mjs --input players_25.csv   --version fc25 --output src/data/teams_fc25.json
//   node scripts/transform-kaggle.mjs --input EAFC26-Men.csv   --version fc26 --output src/data/teams_fc26.json
//   node scripts/transform-kaggle.mjs --input male_teams.csv   --version fc22 --output src/data/teams_fc22.json
//   node scripts/transform-kaggle.mjs --input all_players.csv  --version fc24 --leagues-from src/data/teams_fc23.json --output src/data/teams_fc24.json
//
// Auto-detects three CSV formats:
//   Format A (Stefano Leone / standard Kaggle):  overall, club_name, league_name, nationality_name
//   Format B (EAFC community player datasets):   OVR, Team, League, Nation
//   Format C (Kaggle male_teams / team-level):   team_name, overall, league_name, nationality_name, fifa_version
//            For Format C, --version fc22 → filters rows where fifa_version == 22.
//            Team overall is read directly (not derived from players).
//
// --leagues-from <json>  Optional. Path to a previously generated teams JSON.
//   When the CSV has no league column (e.g. all_players.csv for FC24), club names
//   are matched against that reference file to inherit their league. Clubs not found
//   in the reference are silently dropped.
//
// For Formats A and B, overall per team = average of the top 18 players by overall.

import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

const args = process.argv.slice(2)
const getArg = (flag) => {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : null
}

const inputFile    = getArg('--input')
const version      = getArg('--version')
const outputFile   = getArg('--output')
const leaguesFrom     = getArg('--leagues-from')
const mainLeaguesOnly = args.includes('--main-leagues-only')

if (!inputFile || !version || !outputFile) {
  console.error('Usage: node scripts/transform-kaggle.mjs --input <csv> --version <fcXX> --output <out.json> [--leagues-from <ref.json>]')
  process.exit(1)
}

// Build a club-name → league lookup from a reference JSON (used when the CSV has no league column).
// Keys are normalised: lowercase, no accents, no punctuation.
const normalize = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')

const isMainLeague = (name) => {
  const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  // England
  if (n.includes('premier league')) return /^(english )?premier league$/.test(n)
  // Spain — exclude 2nd division (La Liga 2, LALIGA Hypermotion)
  if (n.includes('laliga') || n.includes('la liga') || (n.includes('spain') && n.includes('primera')))
    return !n.includes('hypermotion') && !n.includes('la liga 2') && !n.includes('laliga 2')
  // Germany — top flight only (excludes German 2./3. Bundesliga, Austrian Bundesliga)
  if (n.includes('bundesliga')) return /^(german )?(1\.? )?bundesliga$/.test(n)
  // Italy
  if (n.includes('serie a')) return n.includes('italian') || /^(1\.? )?serie a/.test(n)
  // France
  if (n.includes('ligue 1')) return n.includes('french') || /^ligue 1/.test(n)
  // Portugal (several historical names)
  if (n.includes('liga portugal') || n.includes('primeira liga') || n.includes('liga nos') ||
      n.includes('portuguese liga') || n.includes('liga zon') || n.includes('liga bwin')) return true
  return false
}

const refLeagueMap = {}   // normalized club name → { leagueId, league, nation }
if (leaguesFrom) {
  const ref = JSON.parse(fs.readFileSync(leaguesFrom, 'utf-8'))
  for (const t of ref.teams ?? []) {
    refLeagueMap[normalize(t.name)] = { leagueId: t.leagueId, league: t.league, nation: t.nation }
  }
  console.log(`Loaded ${Object.keys(refLeagueMap).length} clubs from reference: ${leaguesFrom}`)
}

const csv = fs.readFileSync(inputFile, 'utf-8')
const rows = parse(csv, { columns: true, skip_empty_lines: true })

const toSlug = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

// Detect format from first row's keys
const sampleKeys = Object.keys(rows[0] ?? {})
const isFormatC = sampleKeys.includes('team_name') && sampleKeys.includes('fifa_version')
const isFormatB = !isFormatC && sampleKeys.includes('OVR') && sampleKeys.includes('Team')
const isFormatD = !isFormatC && !isFormatB && sampleKeys.includes('Club') && sampleKeys.includes('Overall')
const formatName = isFormatC ? 'C (team-level / male_teams)'
  : isFormatB ? 'B (OVR/Team/League/Nation)'
  : isFormatD ? 'D (Club/Overall/Nation — no league column)'
  : 'A (overall/club_name/league_name)'
console.log(`Detected format: ${formatName}`)

const leagueMap = {}
const teams = []

if (isFormatC) {
  // Format C: one row per team per weekly update.
  // Keep only the latest update per team_id for the target fifa_version.
  const targetGameVersion = version.replace('fc', '')
  const latestByTeam = {}
  for (const row of rows) {
    if (row['fifa_version']?.trim() !== targetGameVersion) continue
    const teamId = row['team_id']?.trim()
    if (!teamId) continue
    const update = parseInt(row['fifa_update'], 10)
    if (!latestByTeam[teamId] || update > latestByTeam[teamId].update) {
      latestByTeam[teamId] = { update, row }
    }
  }
  console.log(`Kept latest update for ${Object.keys(latestByTeam).length} unique teams`)

  for (const { row } of Object.values(latestByTeam)) {
    const name = row['team_name']?.trim()
    const overall = parseInt(row['overall'], 10)
    const leagueName = row['league_name']?.trim()
    const nation = row['nationality_name']?.trim() ?? ''
    if (!name || isNaN(overall) || !leagueName) continue
    if (mainLeaguesOnly && !isMainLeague(leagueName)) continue

    const leagueId = toSlug(leagueName)
    if (!leagueMap[leagueId]) {
      leagueMap[leagueId] = { id: leagueId, name: leagueName, nation }
    }
    teams.push({
      id: `${toSlug(name)}_${version}`,
      name,
      shortName: name.length > 15 ? name.split(' ').pop() : name,
      overall,
      leagueId,
      league: leagueName,
      nation,
    })
  }
} else {
  // Formats A, B, D: player-level data — group by club and average top 18.
  const getField = (row, a, b, d) => {
    if (isFormatB) return row[b]?.trim()
    if (isFormatD) return row[d]?.trim()
    return row[a]?.trim()
  }

  const clubs = {}
  for (const row of rows) {
    const clubName   = getField(row, 'club_name',        'Team',   'Club')
    const leagueName = getField(row, 'league_name',      'League', null)   // Format D has no league
    const nation     = getField(row, 'nationality_name', 'Nation', 'Nation') ?? ''
    const overall    = parseInt(isFormatB ? row['OVR'] : isFormatD ? row['Overall'] : row['overall'], 10)
    if (!clubName || isNaN(overall)) continue

    if (!clubs[clubName]) {
      clubs[clubName] = { name: clubName, league: leagueName, nations: {}, players: [] }
    }
    clubs[clubName].players.push(overall)
    clubs[clubName].nations[nation] = (clubs[clubName].nations[nation] ?? 0) + 1
  }

  let matched = 0, unmatched = 0
  for (const [, club] of Object.entries(clubs)) {
    const top18 = club.players.sort((a, b) => b - a).slice(0, 18)
    if (top18.length < 5) continue
    const overall = Math.round(top18.reduce((sum, v) => sum + v, 0) / top18.length)
    const playerNation = Object.entries(club.nations).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''

    // Resolve league: from CSV directly, or from reference file if missing
    let leagueName = club.league
    let nation = playerNation
    if (!leagueName && leaguesFrom) {
      const ref = refLeagueMap[normalize(club.name)]
      if (!ref) { unmatched++; continue }
      leagueName = ref.league
      nation = ref.nation
      matched++
    }
    if (!leagueName) continue
    if (mainLeaguesOnly && !isMainLeague(leagueName)) continue

    const leagueId = toSlug(leagueName)
    if (!leagueMap[leagueId]) {
      leagueMap[leagueId] = { id: leagueId, name: leagueName, nation }
    }
    teams.push({
      id: `${toSlug(club.name)}_${version}`,
      name: club.name,
      shortName: club.name.length > 15 ? club.name.split(' ').pop() : club.name,
      overall,
      leagueId,
      league: leagueName,
      nation,
    })
  }
  if (leaguesFrom) console.log(`League lookup: ${matched} matched, ${unmatched} unmatched (dropped)`)
}

teams.sort((a, b) => b.overall - a.overall)

const output = {
  version,
  generatedAt: new Date().toISOString().split('T')[0],
  leagues: Object.values(leagueMap).sort((a, b) => a.name.localeCompare(b.name)),
  teams,
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true })
fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8')

console.log(`✓ ${teams.length} teams → ${outputFile}`)
console.log(`✓ ${output.leagues.length} leagues indexed`)
