import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface AverageRoundScoreCardProps {}

export const AverageRoundScoreCard: FC<AverageRoundScoreCardProps> = () => {
  const rankings = useSelector(selectors.selectAverageRoundScoreRankings);
  return <RankingCard title="Average round score" rankings={rankings} />;
};
