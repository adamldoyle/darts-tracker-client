import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface BestScoreToCloseCardProps {}

export const BestScoreToCloseCard: FC<BestScoreToCloseCardProps> = () => {
  const rankings = useSelector(selectors.selectBestScoreToCloseRankings);
  return <RankingCard title="Best score to close" rankings={rankings} />;
};
