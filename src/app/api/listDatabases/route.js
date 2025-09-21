import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const res = await axios.get('http://localhost:3000/db/list');
    return NextResponse.json(res.data);
  } catch (error) {
    console.error('Error fetching databases from backend:', error);
    return NextResponse.json({ databases: [] }, { status: 500 });
  }
}
