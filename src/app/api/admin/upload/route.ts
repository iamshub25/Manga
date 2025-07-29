import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Manga } from '@/lib/models';

function checkAuth(request: NextRequest) {
  const auth = request.cookies.get('admin-auth');
  return auth?.value === 'true';
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const mangaId = data.get('mangaId') as string;

    console.log('Upload request:', { hasFile: !!file, mangaId, fileType: file?.type });

    if (!file || !mangaId) {
      return NextResponse.json({ error: 'File and mangaId required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    await dbConnect();
    const result = await Manga.findByIdAndUpdate(mangaId, { cover: dataUrl });
    
    if (!result) {
      return NextResponse.json({ error: 'Manga not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      url: `/api/cover/${mangaId}` 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: `Upload failed: ${error}` }, { status: 500 });
  }
}