import { IMonitoredState } from '@adamldoyle/reduxjs-toolkit-monitored-slice';
import { DartboardClickDetails } from '../../scoreboard/components';

export interface IPlayerGameStats {
  email: string;
  total: number;
  remaining: number;
  roundsPlayed: number;
  ranking: number;
  busts: number;
  zeroes: number;
  forfeit?: boolean;
}

export interface IGameConfig {
  datePlayed: number;
  players: string[];
  goal: number;
  forfeits?: string[];
}

export type IRounds = Record<string, number>[];
export type IEditRounds = Record<string, string>[];
export type IAllPlayerGameStats = Record<string, IPlayerGameStats>;

export interface IGameData {
  config: IGameConfig;
  rounds: IRounds;
  playerStats: IAllPlayerGameStats;
}

export interface IGame {
  leagueKey: string;
  gameId: string;
  data: IGameData;
  createdAt: number;
  updatedAt: number;
}

export type ILeagueGamesState = IMonitoredState<IGame[]>;


/**
 * Cricket
 */

export enum GameMode {
  OHONE = 'OHONE',
  CRICKET = 'CRICKET',
}

export const GameModeOptions = [
  { value: GameMode.OHONE, label: 'Oh-One (Default)'},
  { value: GameMode.CRICKET, label: 'CRICKET'},
]

export interface IPlayerCricketStats {
  roundsPlayed: number;
  scoringNumberStatus: Record<number, number>;
  scoringTotal: number;
}

export type DartThrow = DartboardClickDetails | null;
export type DartRound = Record<string, [DartThrow, DartThrow ,DartThrow]>;

export interface ICricketGameData {
  config: {
    datePlayed: number;
    players: string[];
    /**
     * Set of numbers to play
     */
    scoringNumbers?: number[];
  };
  rounds: DartRound[];
  playerStats: Record<string, IPlayerCricketStats>;
}

export const defaultCricketNumbers = [20, 19, 18, 17, 16, 15, 25];