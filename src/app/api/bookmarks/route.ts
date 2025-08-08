import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { Bookmark } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    await connectDB();
    const bookmarks = await Bookmark.find({ userId: decoded.userId })
      .populate('mangaId', 'title cover rating slug')
      .sort({ updatedAt: -1 });

    const formattedBookmarks = bookmarks.map(bookmark => ({
      _id: bookmark._id,
      status: bookmark.status,
      rating: bookmark.rating,
      notes: bookmark.notes,
      createdAt: bookmark.createdAt,
      updatedAt: bookmark.updatedAt,
      manga: bookmark.mangaId
    }));

    return NextResponse.json(formattedBookmarks);
  } catch (error) {
    console.error('Bookmarks fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const { mangaId, status, rating, notes } = await request.json();
    
    await connectDB();
    
    const existingBookmark = await Bookmark.findOne({
      userId: decoded.userId,
      mangaId
    });

    if (existingBookmark) {
      existingBookmark.status = status;
      if (rating) existingBookmark.rating = rating;
      if (notes) existingBookmark.notes = notes;
      existingBookmark.updatedAt = new Date();
      await existingBookmark.save();
      
      await existingBookmark.populate('mangaId', 'title cover rating slug');
      return NextResponse.json({
        _id: existingBookmark._id,
        status: existingBookmark.status,
        rating: existingBookmark.rating,
        notes: existingBookmark.notes,
        manga: existingBookmark.mangaId
      });
    }

    const bookmark = new Bookmark({
      userId: decoded.userId,
      mangaId,
      status,
      rating,
      notes
    });

    await bookmark.save();
    await bookmark.populate('mangaId', 'title cover rating slug');
    
    return NextResponse.json({
      _id: bookmark._id,
      status: bookmark.status,
      rating: bookmark.rating,
      notes: bookmark.notes,
      manga: bookmark.mangaId
    });
  } catch (error) {
    console.error('Bookmark create error:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}