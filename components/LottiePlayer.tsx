'use client';

import { useEffect, useRef } from 'react';

interface LottiePlayerProps {
  src: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

export default function LottiePlayer({ src, className = '', loop = true, autoplay = true, style }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadLottie = async () => {
      // Dynamically load lottie-web from CDN if not already loaded
      if (!(window as any).lottie) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load lottie-web'));
          document.head.appendChild(script);
        });
      }

      // Fetch and parse the JSON data
      const response = await fetch(src);
      const animationData = await response.json();

      // Destroy previous animation if exists
      if (animRef.current) {
        animRef.current.destroy();
      }

      animRef.current = (window as any).lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop,
        autoplay,
        animationData,
      });
    };

    loadLottie().catch(console.error);

    return () => {
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [src, loop, autoplay]);

  return <div ref={containerRef} className={className} style={style} />;
}
