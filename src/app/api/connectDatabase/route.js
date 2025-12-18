import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { dbName } = await request.json();
    if (!dbName) {
      return NextResponse.json({ message: 'Database name is required.' }, { status: 400 });
    }
    const backendUrl = process.env.BACKEND_URL;
    console.log("This is for the calling of the backendURL", backendUrl);
    const res = await axios.post(`${backendUrl}/db/connect`, { dbName });
    return NextResponse.json(res.data);
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    return NextResponse.json(
      { message: 'Failed to connect to database', error: error.message },
      { status: 500 }
    );
  }
}