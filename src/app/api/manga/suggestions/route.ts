import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Manga } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    await dbConnect();
    
    const suggestions = await Manga.find({
      title: { $regex: query, $options: 'i' }
    })
    .select('title')
    .limit(5)
    .lean();

    return NextResponse.json(suggestions.map(m => m.title));
  } catch (error) {
    return NextResponse.json([]);
  }
}