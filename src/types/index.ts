export interface Player {
  id: number
  name: string
  team: string
  teamShort: string
  position: Position
  photoUrl: string
  ownership: number
  nowCost: number
  totalPoints: number
  form: number
  opponentShort: string | null
  isHome: boolean | null
}

export interface Team {
  id: number
  name: string
  short_name: string
  code: number
}

export interface FPLData {
  elements: Player[]
  teams: Team[]
  events: GameWeek[]
}

export interface GameWeek {
  id: number
  name: string
  deadline_time: string
  is_current: boolean
  is_next: boolean
  finished: boolean
}

export interface CurrentGameweek {
  number: number
  deadline: string | null
  isDeadlinePassed: boolean
}

export interface GameweekPick {
  gameweek: number
  playerId: number
  playerName: string
  team: string
  teamShort: string
  shirtUrl: string
  points: number
  ownership: number
}

export interface UserStanding {
  userId: string
  username: string
  profileImageUrl: string | null
  totalPoints: number
  picks: GameweekPick[]
}

export interface StandingsResponse {
  gameweeks: number[]
  standings: UserStanding[]
}

export interface Profile {
  id: string
  username: string
  email: string
  profileImageUrl: string | null
}

export type Position = 'GKP' | 'DEF' | 'MID' | 'FWD'

export const POSITIONS: Record<number, Position> = {
  1: 'GKP',
  2: 'DEF',
  3: 'MID',
  4: 'FWD'
}

export const POSITION_COLORS: Record<Position, string> = {
  GKP: 'bg-amber-500',
  DEF: 'bg-emerald-500',
  MID: 'bg-sky-500',
  FWD: 'bg-rose-500'
}
