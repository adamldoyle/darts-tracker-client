import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface BestRoundsEverCardProps {}

export const BestRoundsEverCard: FC<BestRoundsEverCardProps> = () => {
  const rankings = useSelector(selectors.selectTopTenRoundRankings);
  return <RankingCard title="Top 10 scoring rounds" rankings={rankings} />;
};
