export interface WeatherData {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  main: {
    temp: number; feels_like: number; temp_min: number; temp_max: number;
    pressure: number; humidity: number; sea_level?: number; grnd_level?: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  dt: number;
  sys: { country: string; sunrise: number; sunset: number };
  timezone: number;
  name: string;
  cod: number;
}

export interface ForecastData {
  cod: string; message: number; cnt: number; list: ForecastItem[];
  city: {
    id: number; name: string; coord: { lat: number; lon: number };
    country: string; population: number; timezone: number; sunrise: number; sunset: number;
  };
}

export interface ForecastItem {
  dt: number;
  main: { temp: number; feels_like: number; temp_min: number; temp_max: number; pressure: number; humidity: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  clouds: { all: number };
  wind: { speed: number; deg: number; gust?: number };
  visibility: number; pop: number; dt_txt: string;
}

export interface SearchHistoryEntry {
  query: string; timestamp: number; name?: string; country?: string; temp?: number; icon?: string;
}

export interface GeoLocation {
  name: string; local_names?: Record<string, string>; lat: number; lon: number; country: string; state?: string;
}