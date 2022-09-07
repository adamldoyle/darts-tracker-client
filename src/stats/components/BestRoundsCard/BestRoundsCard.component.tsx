import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface BestRoundsCardProps {}

export const BestRoundsCard: FC<BestRoundsCardProps> = () => {
  const rankings = useSelector(selectors.selectBestRoundRankings);
  return <RankingCard title="Best scoring round" rankings={rankings} />;
};
