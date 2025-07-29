import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Manga } from '@/lib/models';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const manga = await Manga.findById(params.id).select('cover');
    
    if (!manga?.cover) {
      return new NextResponse('Cover not found', { status: 404 });
    }

    // If cover is a URL, proxy it
    if (manga.cover.startsWith('http')) {
      const imageResponse = await fetch(manga.cover);
      const imageBuffer = await imageResponse.arrayBuffer();
      
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // If cover is base64 data URL
    if (manga.cover.startsWith('data:')) {
      const base64Data = manga.cover.split(',')[1];
      const mimeType = manga.cover.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
      const buffer = Buffer.from(base64Data, 'base64');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // Fallback for other data
    return new NextResponse(manga.cover, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    return new NextResponse('Error loading cover', { status: 500 });
  }
}