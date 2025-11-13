import { useEffect, useRef, FC } from 'react';

export const getScoringNumberFromBed = (bed: string) => {
  return !bed ? 0 : (bed?.endsWith(`25`) || bed?.endsWith(`50`)) ? 25 : parseInt(bed.replace(/[A-Z]+/g, ''));
}

export const isDoubleScore = (bed: string) => {
  return [
    'D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','D14','D15','D16','D17','D18','D19','D20','DB50',
  ].includes(bed);
}

export const isTripleScore = (bed: string) => {
  return [
    'T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','T13','T14','T15','T16','T17','T18','T19','T20',
  ].includes(bed);
}

export interface DartboardClickDetails {
  bed: string;
  ring: string;
  score: number;
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
