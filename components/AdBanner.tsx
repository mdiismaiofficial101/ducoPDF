'use client';

import { useEffect, useRef, useState } from 'react';

const MOBILE_AD_KEY = '24a098082016bcfd30b73b78539359d0';
const DESKTOP_AD_KEY = '5db9267f44333ccda8c5452416e4652a';

export default function AdBanner({ className = '' }: { className?: string }) {
  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.body.appendChild(s);
      });

    loadScript(`https://www.highperformanceformat.com/${MOBILE_AD_KEY}/invoke.js`);
    loadScript(`https://www.highperformanceformat.com/${DESKTOP_AD_KEY}/invoke.js`);
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;

    const injectAd = (container: HTMLDivElement, key: string, h: number, w: number) => {
      if (!container || container.querySelector('iframe')) return;
      const inlineScript = document.createElement('script');
      inlineScript.textContent = `atOptions = { 'key': '${key}', 'format': 'iframe', 'height': ${h}, 'width': ${w}, 'params': {} };`;
      container.appendChild(inlineScript);
      const loader = document.createElement('script');
      loader.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
      container.appendChild(loader);
    };

    if (isMobile && mobileRef.current) {
      injectAd(mobileRef.current, MOBILE_AD_KEY, 50, 320);
    } else if (!isMobile && desktopRef.current) {
      injectAd(desktopRef.current, DESKTOP_AD_KEY, 90, 728);
    }
  }, [isMobile]);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div ref={mobileRef} className="md:hidden min-h-[50px]" />
      <div ref={desktopRef} className="hidden md:block min-h-[90px]" />
    </div>
  );
}
