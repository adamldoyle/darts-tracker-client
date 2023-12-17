import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface AverageRoundsPlayedCardProps {
  onClick: () => void;
}

export const AverageRoundsPlayedCard: FC<AverageRoundsPlayedCardProps> = ({ onClick }) => {
  const rankings = useSelector(selectors.selectAverageRoundsPlayedRankings);
  return <RankingCard title="Average rounds per game" rankings={rankings} onClick={onClick} />;
};
