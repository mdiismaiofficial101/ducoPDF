'use client';

import { useEffect, useRef } from 'react';

const NATIVE_CONTAINER_ID = 'container-4dd643ec9282a43f073d3f22a00c125d';

export default function NativeAd({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.async = true as any;
        s.setAttribute('data-cfasync', 'false');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.body.appendChild(s);
      });

    loadScript('https://pl30483783.effectivecpmnetwork.com/4dd643ec9282a43f073d3f22a00c125d/invoke.js');
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div ref={containerRef} id={NATIVE_CONTAINER_ID} />
    </div>
  );
}
