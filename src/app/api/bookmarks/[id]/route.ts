import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { Bookmark } from '@/lib/models';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const { id } = await params;
    
    await connectDB();
    const bookmark = await Bookmark.findOne({
      userId: decoded.userId,
      mangaId: id
    }).populate('mangaId', 'title cover rating slug');

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: bookmark._id,
      status: bookmark.status,
      rating: bookmark.rating,
      notes: bookmark.notes,
      manga: bookmark.mangaId
    });
  } catch (error) {
    console.error('Bookmark fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmark' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const { id } = await params;
    
    await connectDB();
    const result = await Bookmark.deleteOne({
      userId: decoded.userId,
      mangaId: id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bookmark delete error:', error);
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}