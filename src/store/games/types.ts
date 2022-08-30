import { IMonitoredState } from '@adamldoyle/reduxjs-toolkit-monitored-slice';

export interface IPlayerGameStats {
  email: string;
  total: number;
  remaining: number;
  roundsPlayed: number;
  ranking: number;
  busts: number;
  zeroes: number;
}

export interface IGameConfig {
  players: string[];
  goal: number;
}

export type IRounds = Record<string, number>[];
export type IAllPlayerGameStats = Record<string, IPlayerGameStats>;

export interface IGameData {
  players?: string[];
  goal?: number;
  config: IGameConfig;
  rounds: IRounds;
  playerStats: IAllPlayerGameStats;
}

export interface IGame {
  leagueKey: string;
  gameId: string;
  data: IGameData;
  updatedAt: number;
}

export type ILeagueGamesState = IMonitoredState<IGame[]>;
