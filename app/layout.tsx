import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import ShowFooter from '@/components/ShowFooter';
import UserConsent from '@/components/UserConsent';
import JsonLd from '@/components/JsonLd';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL('https://cybronetwork.online'),
  title: {
    default: 'DocuPDF - Free Online PDF Tools | Merge, Split, Compress & Convert PDF',
    template: '%s | DocuPDF',
  },
  description: 'DocuPDF offers 30+ free online PDF tools. Merge, split, compress, convert, rotate, watermark, protect and edit PDFs instantly in your browser. 100% secure, no uploads.',
  keywords: 'pdf tools, online pdf editor, merge pdf, split pdf, compress pdf, free pdf tools, pdf converter, edit pdf online, pdf merger, pdf splitter, pdf compressor, pdf to word, word to pdf',
  authors: [{ name: 'DocuPDF' }],
  creator: 'DocuPDF',
  publisher: 'DocuPDF',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'DocuPDF - Free Online PDF Tools | Merge, Split, Compress & Convert PDF',
    description: 'DocuPDF offers 30+ free online PDF tools. Merge, split, compress, convert, rotate, watermark, protect and edit PDFs instantly in your browser. 100% secure, no uploads.',
    url: 'https://cybronetwork.online',
    siteName: 'DocuPDF',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://docupdf.com/myicon.png',
        width: 1200,
        height: 630,
        alt: 'DocuPDF - Free Online PDF Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocuPDF - Free Online PDF Tools | Merge, Split, Compress & Convert PDF',
    description: 'DocuPDF offers 30+ free online PDF tools. Merge, split, compress, convert, rotate, watermark, protect and edit PDFs instantly. 100% secure.',
    images: ['https://docupdf.com/myicon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://cybronetwork.online',
  },
  verification: {},
  manifest: '/manifest.webmanifest',
  themeColor: '#1A237E',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DocuPDF',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <style>{`
          body { top: 0px !important; }
          .goog-te-gadget-icon { display:none!important; }
          .goog-te-gadget-simple { display:none!important; }
          #goog-gt-tt { display:none!important; }
          .goog-te-balloon-frame { display:none!important; }
          div.skiptranslate { display:none!important; }
          @keyframes icn-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
          @keyframes icn-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
          @keyframes icn-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
          @keyframes icn-wiggle{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
          @keyframes icn-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          .icn-b{animation:icn-bounce 1s ease-in-out infinite}
          .icn-p{animation:icn-pulse 1.5s ease-in-out infinite}
          .icn-f{animation:icn-float 2s ease-in-out infinite}
          .icn-w{animation:icn-wiggle .5s ease-in-out}
          .icn-s{animation:icn-spin 2s linear infinite}
          .icn-hb:hover svg{animation:icn-bounce .5s ease-in-out}
          .icn-hp:hover svg{animation:icn-pulse .5s ease-in-out}
          .icn-hw:hover svg{animation:icn-wiggle .4s ease-in-out}
        `}</style>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7049109792578274"
          crossOrigin="anonymous"
        />
        <meta name="google-site-verification" content="85-vPsDOw1lvdTydtPzX5XGO_gUkGe1ZIhHVlNfjmZk" />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-slate-50 text-slate-900" suppressHydrationWarning>
        <JsonLd data={generateOrganizationSchema()} />
        <JsonLd data={generateWebSiteSchema()} />
        <div id="google_translate_element" style={{display:'none'}}></div>
        <Script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
        <Script id="google-translate-init" strategy="afterInteractive">{`window.googleTranslateElementInit=function(){new window.google.translate.TranslateElement({pageLanguage:'en',autoDisplay:false},'google_translate_element')};`}</Script>
        <Script id="analytics-init" strategy="afterInteractive">
          {`
            try {
              let v = parseInt(localStorage.getItem('omnitemp_visit_count')||'0',10);
              localStorage.setItem('omnitemp_visit_count', String(v+1));
              localStorage.setItem('omnitemp_last_visit', new Date().toISOString());
              var pg = window.location.pathname;
              if(pg && pg!=='/'){
                var h = JSON.parse(localStorage.getItem('omnitemp_page_views')||'{}');
                if(!h[pg]) h[pg]=0; h[pg]++; localStorage.setItem('omnitemp_page_views',JSON.stringify(h));
              }
            }catch(e){}
          `}
        </Script>

        <Header />
        <div id="notifBanner" style={{display:'none',background:'linear-gradient(90deg,#1A237E,#283593)',color:'#fff',textAlign:'center',padding:'8px 16px',fontSize:'13px',fontWeight:600,cursor:'pointer',position:'relative',width:'100%'}}>
          <span id="notifText"></span>
          <span id="notifClose" style={{position:'absolute',right:16,top:'50%',transform:'translateY(-50%)'}}>✕</span>
        </div>
        <Script id="notif-check" strategy="afterInteractive">
          {`
            try{
              var n = JSON.parse(localStorage.getItem('omnitemp_notifications')||'[]');
              var u = JSON.parse(localStorage.getItem('omnitemp_user')||'null');
              var uid = u ? u.email : 'anonymous';
              var unread = n.filter(function(x){ return !x.readBy || !x.readBy.includes(uid); });
              if(unread.length>0){
                var nb = document.getElementById('notifBanner');
                var nt = document.getElementById('notifText');
                var nc = document.getElementById('notifClose');
                if(nb && nt){
                  nt.textContent = unread[0].title + ': ' + unread[0].message;
                  nb.style.display = 'block';
                  if(nc) nc.onclick = function(){ nb.style.display='none'; };
                }
              }
            }catch(e){}
          `}
        </Script>
        <main className="flex-grow">
          {children}
        </main>
        <ShowFooter />
        <UserConsent />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
