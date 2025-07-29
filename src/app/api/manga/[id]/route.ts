import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Manga } from '@/lib/models';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const manga = await Manga.findOne({
      $or: [{ _id: id }, { slug: id }]
    });
    
    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }
    
    // Increment view count
    manga.views = (manga.views || 0) + 1;
    await manga.save();
    
    return NextResponse.json(manga);
  } catch (error) {
    console.error('Error fetching manga:', error);
    return NextResponse.json({ error: 'Failed to fetch manga' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();
    
    await dbConnect();
    
    const manga = await Manga.findOneAndUpdate(
      { $or: [{ _id: id }, { slug: id }] },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    
    if (!manga) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }
    
    return NextResponse.json(manga);
  } catch (error) {
    console.error('Error updating manga:', error);
    return NextResponse.json({ error: 'Failed to update manga' }, { status: 500 });
  }
}