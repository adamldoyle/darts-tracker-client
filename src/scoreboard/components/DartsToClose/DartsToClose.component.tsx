import { FC, memo } from 'react';
import { DARTS_TO_CLOSE } from 'scoreboard/utils/darts';

export interface DartsToCloseProps {
  remaining: number;
}

export const DartsToClose: FC<DartsToCloseProps> = memo(({ remaining }) => {
  const darts = DARTS_TO_CLOSE[remaining];

  if (!darts) {
    return null;
  }

  return <>({darts.map((dart) => dart.display).join(' ')})</>;
});
