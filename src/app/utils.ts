export function kelvinToCelsius(k: number): number { return Math.round((k - 273.15) * 10) / 10; }
export function kelvinToFahrenheit(k: number): number { return Math.round(((k - 273.15) * 9) / 5 + 32); }
export function celsiusToFahrenheit(c: number): number { return Math.round((c * 9) / 5 + 32); }

export function formatTime(unix: number, timezoneOffset: number): string {
  const date = new Date((unix + timezoneOffset) * 1000);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

export function formatDate(unix: number, timezoneOffset: number): string {
  const date = new Date((unix + timezoneOffset) * 1000);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

export function getWindDirection(deg: number): string {
  const directions = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return directions[Math.round(deg / 22.5) % 16];
}

export function getWeatherBackground(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("thunderstorm")) return "from-gray-900 via-purple-950 to-indigo-950";
  if (lower.includes("snow")) return "from-slate-200 via-blue-200 to-sky-300";
  if (lower.includes("rain") || lower.includes("drizzle")) return "from-slate-800 via-blue-900 to-slate-950";
  if (lower.includes("cloud") || lower.includes("overcast")) return "from-slate-500 via-slate-600 to-slate-800";
  if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) return "from-slate-400 via-slate-500 to-slate-700";
  if (lower.includes("clear")) return "from-sky-400 via-blue-500 to-indigo-600";
  return "from-sky-500 via-blue-600 to-indigo-700";
}

export function getWeatherEmoji(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("thunderstorm")) return "⛈️";
  if (lower.includes("snow")) return "🌨️";
  if (lower.includes("rain")) return "🌧️";
  if (lower.includes("drizzle")) return "🌦️";
  if (lower.includes("cloud")) return "☁️";
  if (lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) return "🌫️";
  if (lower.includes("clear")) return "☀️";
  return "🌤️";
}

export function getWeatherAnimationType(description: string): "rain" | "snow" | "clouds" | "thunderstorm" | "none" {
  const lower = description.toLowerCase();
  if (lower.includes("thunderstorm")) return "thunderstorm";
  if (lower.includes("snow")) return "snow";
  if (lower.includes("rain") || lower.includes("drizzle")) return "rain";
  if (lower.includes("cloud") || lower.includes("overcast") || lower.includes("mist") || lower.includes("fog") || lower.includes("haze")) return "clouds";
  if (lower.includes("clear")) return "none";
  return "clouds";
}