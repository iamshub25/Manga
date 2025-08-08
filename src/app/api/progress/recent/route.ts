import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { ReadingProgress } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    await connectDB();
    const recentProgress = await ReadingProgress.find({ 
      userId: decoded.userId,
      completed: false 
    })
    .populate('mangaId', 'title cover slug')
    .sort({ lastRead: -1 })
    .limit(10);

    return NextResponse.json(recentProgress);
  } catch (error) {
    console.error('Recent progress fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch recent progress' }, { status: 500 });
  }
}