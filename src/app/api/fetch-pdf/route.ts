import { NextRequest } from 'next/server';

const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
const allowedContentTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url || !allowedExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
    return new Response('Invalid or missing file URL', { status: 400 });
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new Response('Failed to fetch file', { status: 502 });
    }
    const contentType = response.headers.get('content-type') || '';
    if (!allowedContentTypes.some(type => contentType.startsWith(type))) {
      return new Response('File type not allowed', { status: 400 });
    }
    const contentDisposition = `inline; filename="${url.split('/').pop() || 'file'}"`;
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response('Error fetching file', { status: 500 });
  }
} 