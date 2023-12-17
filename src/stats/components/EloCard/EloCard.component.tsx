import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';
import { selectors as leagueSelectors } from 'store/leagues/slice';

export interface EloCardProps {
  onClick: () => void;
}

export const EloCard: FC<EloCardProps> = ({ onClick }) => {
  const rankings = useSelector(selectors.selectEloRankings);
  const eloKFactor = useSelector(leagueSelectors.selectEloKFactor);
  return <RankingCard title={`ELO rankings (k=${eloKFactor})`} rankings={rankings} onClick={onClick} />;
};
