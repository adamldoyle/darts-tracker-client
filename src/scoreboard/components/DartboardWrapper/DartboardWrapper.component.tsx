import { useEffect, useRef, FC } from 'react';

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
