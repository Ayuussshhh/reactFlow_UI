// src/app/api/listColumns/route.js
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tableName = searchParams.get("tableName");

    if (!tableName) {
      return NextResponse.json({ message: "Table name is required" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

    // pass query param to backend
    const res = await axios.get(`${backendUrl}/listColumns?tableName=${tableName}`);

    return NextResponse.json(res.data);
  } catch (error) {
    console.log(error)
    console.error("Error fetching columns:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
