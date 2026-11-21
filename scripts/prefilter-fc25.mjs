// Prefilter: extracts FC25 rows (latest update per player) from the combined male_players.csv
import fs from 'fs'
import readline from 'readline'

const input = process.argv[2]
const output = process.argv[3]

const out = fs.createWriteStream(output)
const rl = readline.createInterface({ input: fs.createReadStream(input), crlfDelay: Infinity })

let header = null
const latest = {}

rl.on('line', (line) => {
  if (!header) { header = line; return }
  const comma1 = line.indexOf(',')
  const comma2 = line.indexOf(',', comma1 + 1)
  const comma3 = line.indexOf(',', comma2 + 1)
  const version = line.substring(comma2 + 1, comma3)
  if (version !== '25') return
  const playerId = line.substring(0, comma1)
  const comma4 = line.indexOf(',', comma3 + 1)
  const update = parseInt(line.substring(comma3 + 1, comma4))
  if (!latest[playerId] || update > latest[playerId].update) {
    latest[playerId] = { update, line }
  }
})

rl.on('close', () => {
  out.write(header + '\n')
  let count = 0
  for (const { line } of Object.values(latest)) {
    out.write(line + '\n')
    count++
  }
  out.end()
  console.log(`FC25 players (latest update each): ${count}`)
})
