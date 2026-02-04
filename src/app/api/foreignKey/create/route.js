import axios from 'axios';

const API_BASE = process.env.BACKEND_URL;

export async function POST(request) {
  const body = await request.json();

  try {
    const response = await axios.post(`${API_BASE}/foreignKey/create`, body);
    return Response.json(response.data);
  } catch (error) {
    return Response.json(
      {
        message: error.response?.data?.message || 'Error creating foreign key',
        error: error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
