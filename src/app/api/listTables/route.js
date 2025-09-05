import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const res = await axios.get(`${backendUrl}/listTables`);
    return NextResponse.json(res.data);
  } catch (error) {
    console.error('Error listing tables:', error.message);
    return NextResponse.json(
      { message: 'Failed to list tables', error: error.message },
      { status: 500 }
    );
  }
}