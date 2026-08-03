import { useEffect, useRef, FC } from 'react';

export const getScoringNumberFromBed = (bed: string | null | undefined) => {
  return !bed ? 0 : (bed?.endsWith(`25`) || bed?.endsWith(`50`)) ? 25 : parseInt(bed.replace(/[A-Z]+/g, ''));
}

export const isMissScore = (bed: string | null | undefined) => {
  // Added 'MX' as a default flat missing value
  return [
    'MX', 'M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12','M13','M14','M15','M16','M17','M18','M19','M20',
  ].includes(bed ?? '');
}

export const isDoubleScore = (bed: string | null | undefined) => {
  return [
    'D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','D14','D15','D16','D17','D18','D19','D20','DB50',
  ].includes(bed ?? '');
}

export const isTripleScore = (bed: string | null | undefined) => {
  return [
    'T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','T13','T14','T15','T16','T17','T18','T19','T20',
  ].includes(bed ?? '');
}

export interface DartboardClickDetails {
  bed: string;
  ring: string;
  score: number;
}

export const MISSED_DART: DartboardClickDetails = {
  bed: 'MX',
  ring: 'border',
  score: 0,
}

export interface DartboardWrapperProps {
  size: number;
  onClick: (details: DartboardClickDetails) => void;
}

export const DartboardWrapper: FC<DartboardWrapperProps> = ({ size, onClick }) => {
  const renderedSize = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (size === renderedSize.current || !(window as any).Dartboard) {
      return;
    }
    renderedSize.current = size;
    const dartboard = new (window as any).Dartboard('#dartboard');
    dartboard.render();
  }, [size]);

  useEffect(() => {
    const callback = (d: any) => {
      onClick(d.detail);
    };

    document.querySelector('#dartboard')?.addEventListener('throw', callback);
    return () => {
      document.querySelector('#dartboard')?.removeEventListener('throw', callback);
    };
  }, [onClick, size]);

  return <div key={size} id="dartboard" style={{ width: size, height: size }}></div>;
};
