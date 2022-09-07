import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface AverageRoundsPlayedCardProps {}

export const AverageRoundsPlayedCard: FC<AverageRoundsPlayedCardProps> = () => {
  const rankings = useSelector(selectors.selectAverageRoundsPlayedRankings);
  return <RankingCard title="Average rounds per game" rankings={rankings} />;
};
