'use client';

import { motion } from 'motion/react';
import { FileText, ImageIcon, Table, MonitorPlay, Box, FileCode, Scan, Type } from 'lucide-react';
import LottieIcon from '@/components/LottieIcon';

interface AnimatedIconProps {
  name: string;
  color: string;
  className?: string;
}

export default function AnimatedIcon({ name, className = 'w-8 h-8' }: AnimatedIconProps) {
  // Normalize key for matching
  const keyName = name.toLowerCase().replace(/ pdf/g, '').trim();

  if (keyName === 'merge') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M4 4v16a2 2 0 0 0 2 2h4"
          initial={{ x: -2 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring' }}
        />
        <motion.path
          d="M20 4v16a2 2 0 0 1-2 2h-4"
          initial={{ x: 2 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring' }}
        />
        <path d="M14 2H6a2 2 0 0 0-2 2v2M10 2h4l6 6v2" />
        <motion.path
          d="M12 11v6M9 14h6"
          className="text-amber-500"
          strokeWidth={2.5}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 90] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        />
      </svg>
    );
  }

  if (keyName === 'split') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" className="opacity-40" />
        <motion.line
          x1="12" y1="2" x2="12" y2="22"
          strokeDasharray="3,3"
          animate={{ strokeDashoffset: [0, -6] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <g transform="translate(12, 12)">
          <motion.path
            d="M-4 -4 C-6 -6, -8 -4, -6 -2 C-4 0, 0 -2, 6 -4"
            animate={{ rotate: [-10, 15, -10] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M-4 4 C-6 6, -8 4, -6 2 C-4 0, 0 2, 6 4"
            animate={{ rotate: [10, -15, 10] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </g>
      </svg>
    );
  }

  if (keyName === 'rotate') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.57-.57"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.rect
          x="9" y="9" width="6" height="6" rx="1"
          animate={{ rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    );
  }

  if (keyName === 'compress') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M12 2v6M12 22v-6"
          animate={{ y: [0, 2, 0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M17 5l-5 3-5-3M7 19l5-3 5 3"
          animate={{ scaleY: [1, 0.8, 1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.rect
          x="6" y="8" width="12" height="8" rx="1"
          animate={{ height: [8, 5, 8], y: [8, 9.5, 8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    );
  }

  if (keyName === 'protect') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M7 11V7a5 5 0 0 1 10 0v4"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        />
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <motion.path
          d="M12 15v3"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    );
  }

  if (keyName === 'unlock') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M7 11V7a5 5 0 0 1 9.9-1"
          animate={{ y: [-3, -4, -3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    );
  }

  if (keyName === 'ai summarizer' || keyName === 'translate' || keyName === 'summarizer') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M12 3v4M12 17v4M3 12h4M17 12h4"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M12 7c-2 0-5 3-5 5s3 5 5 5 5-3 5-5-3-5-5-5z"
          animate={{ rotate: 360, scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.circle
          cx="12" cy="12" r="2"
          className="fill-amber-400 stroke-none"
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </svg>
    );
  }

  // --- Phase 4: Unique Animated Icons ---

  if (keyName === 'translator') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.circle cx="12" cy="12" r="9" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" opacity={0.5} />
        <motion.path d="M7 8h2.5M9.5 8h2M8 8l1 3M15 8h2l1 3M16 8l-2 6M12 12l-1 3" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.path d="M7 16h10" animate={{ x: [-1, 1, -1] }} transition={{ duration: 1.5, repeat: Infinity }} />
      </svg>
    );
  }

  if (keyName === 'ocr to editable') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <motion.path d="M4 7h16" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <path d="M4 12h16" />
        <path d="M4 17h10" />
        <motion.path d="M16 14l3 3-3 3" className="text-amber-500" animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <motion.circle cx="8" cy="17" r="1" className="fill-amber-500 stroke-none" animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1, repeat: Infinity }} />
      </svg>
    );
  }

  if (keyName === 'password checker' || keyName === 'password check') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M12 2l9 4v6c0 5.5-4.25 10.5-9 11-4.75-.5-9-5.5-9-11V6l9-4z" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.path d="M9 12l2 2 4-4" strokeWidth={3} className="text-green-500" animate={{ pathLength: [0, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }} />
        <motion.path d="M12 9v3l1 1" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
      </svg>
    );
  }

  if (keyName === 'resume builder') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" animate={{ y: [0, -1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
        <path d="M14 2v6h6" />
        <motion.circle cx="12" cy="13" r="3" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.path d="M8 20c0-2.5 1.5-4.5 4-4.5s4 2 4 4.5" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.path d="M9 17l3 3 3-3" className="text-amber-500" strokeWidth={1.5} animate={{ y: [0, -1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
      </svg>
    );
  }

  if (keyName === 'smart watermark') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <motion.path d="M3 15l4-4 3 3 4-5 7 7" animate={{ strokeDashoffset: [0, -50] }} transition={{ duration: 4, repeat: Infinity }} />
        <motion.path d="M16 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="18" cy="18" r="2" className="fill-amber-500/20" animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
      </svg>
    );
  }

  if (keyName === 'template library') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.rect x="3" y="3" width="7" height="7" rx="1" animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <motion.rect x="3" y="14" width="7" height="7" rx="1" animate={{ scale: [1.03, 1, 1.03] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <motion.path d="M6.5 6.5v1M6.5 17.5v1M17.5 6.5v1" className="text-amber-500" strokeWidth={3} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
      </svg>
    );
  }

  if (keyName === 'community q&a' || keyName === 'community qa') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" animate={{ y: [0, -1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="12" cy="10" r="1.5" className="fill-amber-500 stroke-none" animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <motion.path d="M9 13c0-1.5 1-2.5 3-2.5s3 1 3 2.5" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.path d="M9 7h6" strokeWidth={3} animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 1.5, repeat: Infinity }} />
      </svg>
    );
  }

  if (keyName === 'word to' || keyName === 'pdf to word') return <FileText className={className} />;
  if (keyName === 'jpg to' || keyName === 'pdf to jpg') return <ImageIcon className={className} />;
  if (keyName === 'pdf to excel' || keyName === 'excel to') return <Table className={className} />;
  if (keyName === 'pdf to ppt' || keyName === 'ppt to') return <MonitorPlay className={className} />;
  if (keyName === 'pdf to pdf/a') return <Box className={className} />;
  if (keyName === 'html to') {
    return <LottieIcon src="/lottie/web-development.json" className={className} />;
  }
  if (keyName === 'scan to') return <Scan className={className} />;
  if (keyName === 'pdf to markdown') return <FileCode className={className} />;
  if (keyName === 'ocr to editable') return <Type className={className} />;

  if (keyName === 'esignature' || keyName === 'signature') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M4 20c4-4 8 2 12-2s4-4 4-4"
          strokeDasharray="40"
          strokeDashoffset="40"
          animate={{ strokeDashoffset: [40, 0, 40] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M14.5 5.5l5 5L9 21H4v-5L14.5 5.5z"
          animate={{ 
            x: [0, 4, 8, 12, 16, 0],
            y: [0, -2, 2, -4, 2, 0] 
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    );
  }

  // DEFAULT DOCUMENT FALLBACK
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <motion.path
        d="M14 2v6h6"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.line
        x1="16" y1="13" x2="8" y2="13"
        animate={{ x: [-1, 2, -1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.line
        x1="16" y1="17" x2="8" y2="17"
        animate={{ x: [1, -2, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.line
        x1="10" y1="9" x2="8" y2="9"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </svg>
  );
}
