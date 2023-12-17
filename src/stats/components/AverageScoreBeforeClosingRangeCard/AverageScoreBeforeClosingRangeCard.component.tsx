import { FC } from 'react';
import { RankingCard } from '../RankingCard';
import { useSelector } from 'react-redux';
import { selectors } from 'store/games/slice';

export interface AverageScoreBeforeClosingRangeCardProps {}

export const AverageScoreBeforeClosingRangeCard: FC<AverageScoreBeforeClosingRangeCardProps> = () => {
  const rankings = useSelector(selectors.selectAverageScoreBeforeClosingRangeRankings);
  return <RankingCard title="Average round score before closing range" rankings={rankings} />;
};
