import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('tableName');

  if (!tableName) {
    return Response.json(
      { message: 'Table name is required' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `${API_BASE}/foreignKey/list?tableName=${encodeURIComponent(tableName)}`
    );
    return Response.json(response.data);
  } catch (error) {
    return Response.json(
      {
        message: error.response?.data?.message || 'Error fetching foreign keys',
        error: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
