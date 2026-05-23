import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY || "";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const limit = searchParams.get("limit") || "5";

  if (!API_KEY) {
    return NextResponse.json(
      { error: "OpenWeatherMap API key not configured. Set OPENWEATHER_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    let url: string;
    if (endpoint === "geo") {
      if (!q) return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
      url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${API_KEY}`;
    } else if (endpoint === "weather") {
      if (lat && lon) { url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`; }
      else if (q) { url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&appid=${API_KEY}`; }
      else { return NextResponse.json({ error: "Provide lat/lon or q" }, { status: 400 }); }
    } else if (endpoint === "forecast") {
      if (lat && lon) { url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`; }
      else if (q) { url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(q)}&appid=${API_KEY}`; }
      else { return NextResponse.json({ error: "Provide lat/lon or q" }, { status: 400 }); }
    } else {
      return NextResponse.json({ error: "Invalid endpoint. Use 'weather', 'forecast', or 'geo'" }, { status: 400 });
    }

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.message || "API request failed", cod: data.cod }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}