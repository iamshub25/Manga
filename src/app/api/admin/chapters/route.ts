import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Chapter, Manga } from '@/lib/models';

function checkAuth(request: NextRequest) {
  const auth = request.cookies.get('admin-auth');
  return auth?.value === 'true';
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    
    const chapters = await Chapter.find()
      .populate('mangaId', 'title')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(chapters);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { chapterId, chapterIds } = await request.json();
    await dbConnect();
    
    if (chapterIds) {
      await Chapter.deleteMany({ _id: { $in: chapterIds } });
    } else {
      await Chapter.findByIdAndDelete(chapterId);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}