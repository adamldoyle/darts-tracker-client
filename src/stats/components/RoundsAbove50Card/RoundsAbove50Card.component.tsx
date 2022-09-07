import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface RoundsAbove50CardProps {}

export const RoundsAbove50Card: FC<RoundsAbove50CardProps> = () => {
  const rankings = useSelector(selectors.selectRoundsAbove50Rankings);
  return <RankingCard title="Round scores above 50" rankings={rankings} />;
};
