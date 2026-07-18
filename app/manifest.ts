import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DocuPDF - Free Online PDF Tools',
    short_name: 'DocuPDF',
    description: '30+ free online PDF tools. Merge, split, compress, convert, rotate, watermark, protect and edit PDFs instantly in your browser. 100% secure, no uploads.',
    start_url: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#f8fafc',
    theme_color: '#1A237E',
    categories: ['productivity', 'utilities', 'documents'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Merge PDF',
        short_name: 'Merge',
        description: 'Merge multiple PDF files into one',
        url: '/merge',
      },
      {
        name: 'Split PDF',
        short_name: 'Split',
        description: 'Split PDF into separate files',
        url: '/split',
      },
      {
        name: 'Compress PDF',
        short_name: 'Compress',
        description: 'Reduce PDF file size',
        url: '/compress',
      },
    ],
    screenshots: [],
    prefer_related_applications: false,
  };
}
