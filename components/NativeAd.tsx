'use client';

import { useEffect, useRef } from 'react';

const NATIVE_CONTAINER_ID = 'container-4dd643ec9282a43f073d3f22a00c125d';
const NATIVE_AD_KEY = '4dd643ec9282a43f073d3f22a00c125d';

export default function NativeAd({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const injectAd = (container: HTMLDivElement) => {
      if (!container || container.querySelector('iframe')) return;
      const inlineScript = document.createElement('script');
      inlineScript.textContent = `atOptions = { 'key': '${NATIVE_AD_KEY}', 'format': 'iframe', 'height': 250, 'width': 300, 'params': {} };`;
      container.appendChild(inlineScript);
      const loader = document.createElement('script');
      loader.src = `https://pl30483783.effectivecpmnetwork.com/${NATIVE_AD_KEY}/invoke.js`;
      container.appendChild(loader);
    };

    if (containerRef.current) {
      injectAd(containerRef.current);
    }
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div ref={containerRef} id={NATIVE_CONTAINER_ID} />
    </div>
  );
}
