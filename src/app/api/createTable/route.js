import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { tableName, columns } = await request.json();
    if (!tableName || !columns || !Array.isArray(columns)) {
      return NextResponse.json(
        { message: 'tableName and columns (array) are required.' },
        { status: 400 }
      );
    }
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const res = await axios.post(`${backendUrl}/table/create`, { tableName, columns });
    return NextResponse.json(res.data);
  } catch (error) {
    console.error('Error creating table:', error.message);
    return NextResponse.json(
      { message: 'Failed to create table', error: error.message },
      { status: 500 }
    );
  }
}