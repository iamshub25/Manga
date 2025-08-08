import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { username, email, password } = await request.json();

    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return NextResponse.json({ 
        error: existingUser.username === username ? 'Username taken' : 'Email taken' 
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

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
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}