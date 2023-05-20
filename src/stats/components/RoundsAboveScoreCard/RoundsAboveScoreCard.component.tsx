import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';
import { IRootState } from 'store/types';

export interface RoundsAboveScoreCardProps {
  targetScore: number;
}

export const RoundsAboveScoreCard: FC<RoundsAboveScoreCardProps> = ({ targetScore }) => {
  const rankings = useSelector((state: IRootState) => selectors.selectRoundsAboveScoreRankings(state, targetScore));
  return <RankingCard title={`Round scores above ${targetScore}`} rankings={rankings} />;
};
