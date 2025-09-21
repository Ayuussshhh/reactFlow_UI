import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { Name } = await request.json();
    if (!Name) {
      return NextResponse.json({ message: 'Database name is required.' }, { status: 400 });
    }
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const res = await axios.post(`${backendUrl}/db/create`, { Name });
    return NextResponse.json(res.data);
  } catch (error) {
    console.error('Error creating database:', error.message);
    return NextResponse.json(
      { message: 'Failed to create database', error: error.message },
      { status: 500 }
    );
  }
}