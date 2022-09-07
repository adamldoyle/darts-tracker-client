import { FC } from 'react';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';
import { RankingCard } from '../RankingCard';

export interface WinsCardProps {}

export const WinsCard: FC<WinsCardProps> = () => {
  const rankings = useSelector(selectors.selectTotalWinsRankings);

  return <RankingCard title="Wins" rankings={rankings} />;
};
