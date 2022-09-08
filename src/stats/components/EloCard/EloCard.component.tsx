import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface EloCardProps {
  onClick: () => void;
}

export const EloCard: FC<EloCardProps> = ({ onClick }) => {
  const rankings = useSelector(selectors.selectEloRankings);
  return <RankingCard title="ELO rankings" rankings={rankings} onClick={onClick} />;
};
