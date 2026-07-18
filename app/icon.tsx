import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  const file = readFileSync(join(process.cwd(), 'public', 'myicon.png'));
  return new NextResponse(file, {
    headers: { 'Content-Type': 'image/png', 'Content-Length': String(file.length) },
  });
}
