import { FC } from 'react';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';
import { RankingCard } from '../RankingCard';

export interface CloseLossesCardProps {}

export const CloseLossesCard: FC<CloseLossesCardProps> = () => {
  const rankings = useSelector(selectors.selectCloseLossRankings);

  return <RankingCard title="Close losses" rankings={rankings} />;
};
