import { NextRequest, NextResponse } from 'next/server';

const WWW_HOST = 'www.cybronetwork.online';
const CANONICAL_HOST = 'cybronetwork.online';

export function middleware(request: NextRequest) {
  const { protocol, hostname, pathname, search } = request.nextUrl;

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const isHttps = protocol === 'https:' || forwardedProto === 'https';

  if (!isHttps && (hostname !== 'localhost' && hostname !== '127.0.0.1')) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  if (hostname === WWW_HOST) {
    const url = new URL(request.url);
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|myicon.png|icons/|manifest.webmanifest|sw.js|robots.txt).*)',
  ],
};