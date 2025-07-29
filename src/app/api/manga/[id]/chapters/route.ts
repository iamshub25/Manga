import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Chapter, Manga } from '@/lib/models';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    // Find manga by ID or slug
    const manga = await Manga.findOne({
      $or: [{ _id: id }, { slug: id }]
    });
    
    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }
    
    // Get chapters for this manga
    const chapters = await Chapter.find({ mangaId: manga._id })
      .select('title number language pages createdAt')
      .lean();
    
    // Sort chapters numerically by number
    chapters.sort((a, b) => {
      const aNum = parseFloat(a.number) || 0;
      const bNum = parseFloat(b.number) || 0;
      return aNum - bNum;
    });
    
    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}