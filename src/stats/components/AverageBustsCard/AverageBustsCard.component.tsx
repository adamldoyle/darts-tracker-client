import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { selectors } from 'store/games/slice';
import { useSelector } from 'react-redux';

export interface AverageBustsCardProps {}

export const AverageBustsCard: FC<AverageBustsCardProps> = () => {
  const rankings = useSelector(selectors.selectAverageBustsRankings);
  return <RankingCard title="Average busts per game" rankings={rankings} />;
};
