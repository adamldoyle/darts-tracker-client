export const formatNumber = (value: number, decimalPlaces = 0): number => {
  const shift = Math.pow(10, decimalPlaces);
  return Math.round(shift * value) / shift;
};

export const formatDivision = (numerator: number, denominator: number, decimalPlaces = 0): number => {
  const shift = Math.pow(10, decimalPlaces);
  return Math.round((shift * (numerator + Number.EPSILON)) / denominator) / shift;
};

export const formatPercent = (numerator: number, denominator: number, decimalPlaces = 0): number => {
  const shift = Math.pow(10, decimalPlaces);
  return Math.round((100 * shift * (numerator + Number.EPSILON)) / denominator) / shift;
};
