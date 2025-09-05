import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { databaseName } = await request.json();
    if (!databaseName) {
      return NextResponse.json(
        { message: 'Database name is required to delete.' },
        { status: 400 }
      );
    }
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const res = await axios.post(`${backendUrl}/deleteDatabase`, { databaseName });
    return NextResponse.json(res.data);
  } catch (error) {
    console.error('Error deleting database:', error.message);
    return NextResponse.json(
      { message: 'Failed to delete database', error: error.message },
      { status: 500 }
    );
  }
}