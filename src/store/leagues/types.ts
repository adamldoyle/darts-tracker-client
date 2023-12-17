import { IMonitoredState } from '@adamldoyle/reduxjs-toolkit-monitored-slice';

export interface IPlayer {
  email: string;
}

export interface ILeague {
  leagueKey: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeagueWithMembers extends ILeague {
  membership: IPlayer[];
}

export interface ILeaguesState extends IMonitoredState<ILeague[]> {
  selectedLeague: ILeagueWithMembers | null;
  eloKFactor: number;
}
