import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Chapter, Manga } from '@/lib/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapter: string }> }
) {
  try {
    const { id, chapter } = await params;
    await dbConnect();
    
    // Find manga by ID or slug
    const manga = await Manga.findOne({
      $or: [{ _id: id }, { slug: id }]
    });
    
    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }
    
    // Find chapter by ID or number
    const chapterDoc = await Chapter.findOne({
      $and: [
        { mangaId: manga._id },
        { $or: [{ _id: chapter }, { number: chapter }] }
      ]
    });
    
    if (!chapterDoc) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      id: chapterDoc._id,
      title: chapterDoc.title,
      mangaTitle: manga.title,
      pages: chapterDoc.pages || []
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 500 });
  }
}