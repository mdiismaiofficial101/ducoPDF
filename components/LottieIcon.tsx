'use client';

import { useEffect, useRef } from 'react';

interface LottieIconProps {
  src: string;
  className?: string;
}

export default function LottieIcon({ src, className = 'w-8 h-8' }: LottieIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const loadLottie = async () => {
      if (!(window as any).lottie) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load lottie-web'));
          document.head.appendChild(script);
        });
      }

      if (cancelled) return;

      const response = await fetch(src);
      const animationData = await response.json();

      if (cancelled) return;

      if (animRef.current) {
        animRef.current.destroy();
      }

      animRef.current = (window as any).lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
        },
      });
    };

    loadLottie().catch(console.error);

    return () => {
      cancelled = true;
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ lineHeight: 0, overflow: 'hidden' }}
    />
  );
}
