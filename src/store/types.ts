import { IAuthState } from '@adamldoyle/react-aws-auth-redux-slice';
import { ILeagueGamesState } from './games/types';
import { ILeaguesState } from './leagues/types';

export interface IRootState {
  auth: IAuthState;
  leagues: ILeaguesState;
  games: ILeagueGamesState;
}
