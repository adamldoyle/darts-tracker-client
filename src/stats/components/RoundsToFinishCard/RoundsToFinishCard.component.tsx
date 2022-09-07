import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface RoundsToFinishCardProps {}

export const RoundsToFinishCard: FC<RoundsToFinishCardProps> = () => {
  const rankings = useSelector(selectors.selectAverageRoundsToCloseRankings);
  return <RankingCard title="Average rounds to close" rankings={rankings} />;
};
