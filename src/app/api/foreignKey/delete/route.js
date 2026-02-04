import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

export async function POST(request) {
  const body = await request.json();

  try {
    const response = await axios.post(`${API_BASE}/foreignKey/delete`, body);
    return Response.json(response.data);
  } catch (error) {
    return Response.json(
      {
        message: error.response?.data?.message || 'Error deleting foreign key',
        error: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
