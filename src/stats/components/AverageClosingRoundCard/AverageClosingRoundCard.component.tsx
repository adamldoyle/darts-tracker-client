import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface AverageClosingRoundCardProps {}

export const AverageClosingRoundCard: FC<AverageClosingRoundCardProps> = () => {
  const rankings = useSelector(selectors.selectAverageClosingScoreRankings);
  return <RankingCard title="Average score to close" rankings={rankings} />;
};
