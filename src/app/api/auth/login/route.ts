import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { username, password } = await request.json();

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      theme: user.theme,
      readingMode: user.readingMode
    };

    return NextResponse.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}