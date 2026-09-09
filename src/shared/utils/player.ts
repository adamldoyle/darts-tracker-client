export const displayName = (email: string): string => {
  return email.split('@')[0].split('.')[0];
};

export const defaultPlayerColors = [
  '#8dd3c7',
  '#bebada',
  '#fb8072',
  '#80b1d3',
  '#fdb462',
  '#b3de69',
  '#fccde5',
  '#d9d9d9',
  '#bc80bd',
  '#ccebc5',
  '#ffed6f',
];

export const getPlayerColor = (player: string, index: number, playerColorMap?: Record<string, string>) => {
  return playerColorMap?.[player] ?? defaultPlayerColors[index % defaultPlayerColors.length]
}
