import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface GamesPlayedCardProps {}

export const GamesPlayedCard: FC<GamesPlayedCardProps> = () => {
  const rankings = useSelector(selectors.selectGamesPlayedRankings);
  return <RankingCard title="Games played" rankings={rankings} />;
};
