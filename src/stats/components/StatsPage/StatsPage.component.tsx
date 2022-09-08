import { Box, CircularProgress } from '@material-ui/core';
import { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hooks } from 'store/games/slice';
import { selectors } from 'store/leagues/slice';
import { AverageRoundScoreCard } from '../AverageRoundScoreCard';
import { AverageRoundsPlayedCard } from '../AverageRoundsPlayedCard';
import { AverageBustsCard } from '../AverageBustsCard';
import { BestRoundsCard } from '../BestRoundsCard';
import { RoundsAbove50Card } from '../RoundsAbove50Card';
import { WinsCard } from '../WinsCard';
import { GamesPlayedCard } from '../GamesPlayedCard';
import { WinPercentCard } from '../WinPercentCard';
import { BestRoundsEverCard } from '../BestRoundsEverCard';
import { RoundsToFinishCard } from '../RoundsToFinishCard';
import { AverageClosingRoundCard } from '../AverageClosingRoundCard';
import { BestScoreToCloseCard } from '../BestScoreToCloseCard';
import { EloCard } from '../EloCard';

export interface StatsPageProps {}

export const StatsPage: FC<StatsPageProps> = () => {
  const history = useHistory();
  const selectedLeague = useSelector(selectors.selectSelectedLeague);
  const { loading: gamesLoading } = hooks.useMonitoredData();

  if (gamesLoading || !selectedLeague) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress size={100} />
      </Box>
    );
  }

  return (
    <Box display="flex" flexWrap="wrap" gridGap={8}>
      <EloCard onClick={() => history.push('/stats/elo')} />
      <WinPercentCard />
      <AverageRoundScoreCard />
      <AverageRoundsPlayedCard />
      <AverageClosingRoundCard />
      <RoundsToFinishCard />
      <BestScoreToCloseCard />
      <AverageBustsCard />
      <BestRoundsCard />
      <BestRoundsEverCard />
      <RoundsAbove50Card />
      <WinsCard />
      <GamesPlayedCard />
    </Box>
  );
};