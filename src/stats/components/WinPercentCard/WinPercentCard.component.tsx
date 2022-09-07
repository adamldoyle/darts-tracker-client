import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface WinPercentCardProps {}

export const WinPercentCard: FC<WinPercentCardProps> = () => {
  const rankings = useSelector(selectors.selectWinPercentageRankings);
  return <RankingCard title="Win percentage" rankings={rankings} />;
};
