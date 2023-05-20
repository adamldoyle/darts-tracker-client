import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';
import { IRootState } from 'store/types';

export interface RoundsToFinishCardProps {
  includeBusts: boolean;
}

export const RoundsToFinishCard: FC<RoundsToFinishCardProps> = ({ includeBusts }) => {
  const rankings = useSelector((state: IRootState) =>
    selectors.selectAverageRoundsToCloseRankings(state, includeBusts),
  );
  return (
    <RankingCard title={`Average rounds to close (${includeBusts ? 'with' : 'without'} busts)`} rankings={rankings} />
  );
};
