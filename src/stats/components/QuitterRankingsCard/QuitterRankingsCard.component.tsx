import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface QuitterRankingsCardProps {}

export const QuitterRankingsCard: FC<QuitterRankingsCardProps> = () => {
  const rankings = useSelector(selectors.selectQuitterRankings);
  return <RankingCard title="Biggest quitters" rankings={rankings} />;
};
