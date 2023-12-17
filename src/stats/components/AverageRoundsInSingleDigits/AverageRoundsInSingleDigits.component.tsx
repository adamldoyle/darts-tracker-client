import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface AverageRoundsInSingleDigitsProps {}

export const AverageRoundsInSingleDigits: FC<AverageRoundsInSingleDigitsProps> = () => {
  const rankings = useSelector(selectors.selectAverageRoundsInSingleDigits);
  return <RankingCard title="Average rounds in single digits" rankings={rankings} />;
};
