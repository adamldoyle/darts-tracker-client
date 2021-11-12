import { FC } from 'react';
import { Scoreboard } from '../../../scoreboard/components';

export interface AppProps {}

export const App: FC<AppProps> = () => {
  return <Scoreboard />;
};
