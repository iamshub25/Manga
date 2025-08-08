import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { ReadingProgress } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const { mangaId, chapterNumber, pageNumber, totalPages } = await request.json();
    
    await connectDB();
    
    const existingProgress = await ReadingProgress.findOne({
      userId: decoded.userId,
      mangaId
    });

    if (existingProgress) {
      existingProgress.chapterNumber = chapterNumber;
      existingProgress.pageNumber = pageNumber;
      existingProgress.totalPages = totalPages;
      existingProgress.lastRead = new Date();
      existingProgress.completed = pageNumber >= totalPages;
      await existingProgress.save();
      return NextResponse.json(existingProgress);
    }

    const progress = new ReadingProgress({
      userId: decoded.userId,
      mangaId,
      chapterNumber,
      pageNumber,
      totalPages,
      completed: pageNumber >= totalPages
    });

    await progress.save();
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}