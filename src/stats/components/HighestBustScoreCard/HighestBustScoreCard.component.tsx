import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface HighestBustScoreCardProps {}

export const HighestBustScoreCard: FC<HighestBustScoreCardProps> = () => {
  const rankings = useSelector(selectors.selectHighestBustRankings);
  return <RankingCard title="Highest bust score" rankings={rankings} />;
};
