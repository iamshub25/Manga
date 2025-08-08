import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Manga } from '@/lib/models';

export async function GET() {
  try {
    await connectDB();
    
    const count = await Manga.countDocuments();
    const random = Math.floor(Math.random() * count);
    const manga = await Manga.findOne().skip(random).select('title slug cover rating');
    
    if (!manga) {
      return NextResponse.json({ error: 'No manga found' }, { status: 404 });
    }

    return NextResponse.json(manga);
  } catch (error) {
    console.error('Random manga error:', error);
    return NextResponse.json({ error: 'Failed to get random manga' }, { status: 500 });
  }
}