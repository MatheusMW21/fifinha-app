import { FifaVersion, TeamsData } from '../types'

// Each JSON file is loaded lazily to avoid bundling all data upfront
const dataMap: Record<FifaVersion, () => TeamsData> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fc22: () => require('./teams_fc22.json'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fc23: () => require('./teams_fc23.json'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fc24: () => require('./teams_fc24.json'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fc25: () => require('./teams_fc25.json'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fc26: () => require('./teams_fc26.json'),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fc27: () => require('./teams_fc27.json'),
}

export function getTeamsData(version: FifaVersion): TeamsData {
  return dataMap[version]()
}
