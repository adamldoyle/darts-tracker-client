import { IAuthState } from '@adamldoyle/react-aws-auth-redux-slice';
import { ILeaguesState } from './leagues/types';

export interface IRootState {
  auth: IAuthState;
  leagues: ILeaguesState;
}
