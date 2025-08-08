import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { ReadingProgress } from '@/lib/models';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const { id } = await params;
    
    await connectDB();
    const progress = await ReadingProgress.findOne({
      userId: decoded.userId,
      mangaId: id
    });

    if (!progress) {
      return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}