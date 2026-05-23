"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, MapPin, Droplets, Wind, Eye, Gauge, Sunrise, Sunset,
  Thermometer, CloudRain, Trash2, Clock, Navigation, Star, CloudSnow, Zap,
} from "lucide-react";
import { WeatherData, ForecastData, SearchHistoryEntry, GeoLocation } from "./types";
import {
  kelvinToCelsius, kelvinToFahrenheit, formatTime, formatDate,
  getWindDirection, getWeatherBackground, getWeatherEmoji, getWeatherAnimationType,
} from "./utils";

type TempUnit = "C" | "F";

export default function Home() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<TempUnit>("C");
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [suggestions, setSuggestions] = useState<GeoLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [weatherLoaded, setWeatherLoaded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("weather-search-history");
    if (saved) { try { setHistory(JSON.parse(saved)); } catch { localStorage.removeItem("weather-search-history"); } }
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) { setShowSuggestions(false); setShowHistory(false); }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const container = document.getElementById("weather-effects");
    if (!container) return;
    container.innerHTML = "";
    if (!weather) return;
    const animType = getWeatherAnimationType(weather.weather[0]?.description || "");
    if (animType === "rain" || animType === "thunderstorm") {
      const count = animType === "thunderstorm" ? 60 : 40;
      for (let i = 0; i < count; i++) {
        const drop = document.createElement("div"); drop.className = "rain-drop";
        drop.style.left = Math.random() * 100 + "%"; drop.style.height = (Math.random() * 60 + 40) + "px";
        drop.style.animationDuration = (Math.random() * 0.8 + 0.4) + "s"; drop.style.animationDelay = Math.random() * 3 + "s";
        drop.style.opacity = String(Math.random() * 0.4 + 0.2); container.appendChild(drop);
      }
    }
    if (animType === "snow") {
      for (let i = 0; i < 25; i++) {
        const flake = document.createElement("div"); flake.className = "snowflake"; flake.textContent = "•";
        flake.style.left = Math.random() * 100 + "%"; flake.style.fontSize = (Math.random() * 8 + 6) + "px";
        flake.style.animationDuration = (Math.random() * 4 + 3) + "s"; flake.style.animationDelay = Math.random() * 3 + "s";
        container.appendChild(flake);
      }
    }
    if (animType === "clouds" || animType === "thunderstorm") {
      for (let i = 0; i < 4; i++) {
        const cloud = document.createElement("div"); cloud.className = "floating-cloud";
        cloud.style.width = (Math.random() * 150 + 120) + "px"; cloud.style.height = (Math.random() * 40 + 30) + "px";
        cloud.style.top = (Math.random() * 25 + 5) + "%"; cloud.style.animationDuration = (Math.random() * 30 + 25) + "s";
        cloud.style.animationDelay = Math.random() * 15 + "s"; container.appendChild(cloud);
      }
    }
    if (animType === "thunderstorm") {
      const flash = document.createElement("div"); flash.className = "lightning-flash"; container.appendChild(flash);
    }
  }, [weather]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try { const res = await fetch(`/api/weather?endpoint=geo&q=${encodeURIComponent(q)}&limit=5`); if (res.ok) { const data: GeoLocation[] = await res.json(); setSuggestions(data); } } catch {}
  }, []);

  const onInputChange = (value: string) => {
    setQuery(value); setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const temp = (k: number) => (unit === "C" ? kelvinToCelsius(k) : kelvinToFahrenheit(k));
  const tempLabel = (k: number) => `${temp(k)}°${unit}`;

  const saveToHistory = (data: WeatherData) => {
    const entry: SearchHistoryEntry = { query: `${data.name}, ${data.sys.country}`, timestamp: Date.now(), name: data.name, country: data.sys.country, temp: kelvinToCelsius(data.main.temp), icon: data.weather[0]?.icon };
    const updated = [entry, ...history.filter((h) => h.query !== entry.query)].slice(0, 10);
    setHistory(updated); localStorage.setItem("weather-search-history", JSON.stringify(updated));
  };

  const searchWeather = async (searchQuery: string, lat?: number, lon?: number) => {
    setLoading(true); setError(null); setWeatherLoaded(false); setShowSuggestions(false); setShowHistory(false);
    try {
      const params = new URLSearchParams({ endpoint: "weather" });
      if (lat !== undefined && lon !== undefined) { params.set("lat", String(lat)); params.set("lon", String(lon)); } else { params.set("q", searchQuery); }
      const weatherRes = await fetch(`/api/weather?${params}`); const weatherData = await weatherRes.json();
      if (!weatherRes.ok) { setError(weatherData.error || weatherData.message || "City not found"); setWeather(null); setForecast(null); return; }
      setWeather(weatherData); saveToHistory(weatherData);
      const forecastParams = new URLSearchParams({ endpoint: "forecast", lat: String(weatherData.coord.lat), lon: String(weatherData.coord.lon) });
      const forecastRes = await fetch(`/api/weather?${forecastParams}`);
      if (forecastRes.ok) { setForecast(await forecastRes.json()); }
      setTimeout(() => setWeatherLoaded(true), 100);
    } catch { setError("Failed to fetch weather data. Check your connection."); } finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (query.trim()) searchWeather(query.trim()); };
  const selectSuggestion = (loc: GeoLocation) => { setQuery(`${loc.name}, ${loc.country}${loc.state ? `, ${loc.state}` : ""}`); searchWeather("", loc.lat, loc.lon); };
  const clearHistory = () => { setHistory([]); localStorage.removeItem("weather-search-history"); };
  const dailyForecast = forecast ? forecast.list.filter((item) => item.dt_txt.includes("12:00:00")).slice(0, 5) : [];
  const hourlyForecast = forecast ? forecast.list.slice(0, 8) : [];
  const bgGradient = weather ? getWeatherBackground(weather.weather[0]?.description || "") : "from-sky-500 via-blue-600 to-indigo-700";

  return (
    <main className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-all duration-1000 relative`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <div className="text-center mb-8 fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-2 flex items-center justify-center gap-3">
            {weather ? getWeatherEmoji(weather.weather[0]?.description || "") : "🌤️"}{" "}
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Wealther</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg font-light tracking-wide">Premium weather forecasts for any city worldwide</p>
        </div>

        <div ref={searchRef} className="relative mb-6 fade-in-up" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1 search-glow glass-premium">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
              <input type="text" value={query} onChange={(e) => { onInputChange(e.target.value); setShowSuggestions(true); }} onFocus={() => { if (history.length > 0 && !query) setShowHistory(true); }} placeholder="Search any city..." className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/40 outline-none text-lg font-light" />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-dark text-white rounded-2xl overflow-hidden z-50 shadow-2xl border border-white/10">
                  {suggestions.map((loc, i) => (
                    <button key={`${loc.lat}-${loc.lon}-${i}`} onClick={() => selectSuggestion(loc)} className="w-full px-5 py-3.5 text-left hover:bg-white/10 flex items-center gap-3 transition-all duration-200">
                      <MapPin className="w-4 h-4 text-white/40" /><span className="font-medium">{loc.name}</span><span className="text-white/40 text-sm">{loc.state ? `${loc.state}, ` : ""}{loc.country}</span>
                    </button>
                  ))}
                </div>
              )}
              {showHistory && history.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-dark text-white rounded-2xl overflow-hidden z-50 shadow-2xl border border-white/10">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                    <span className="text-sm text-white/40 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Recent</span>
                    <button onClick={clearHistory} className="text-red-400/80 hover:text-red-300 text-xs flex items-center gap-1 transition-colors"><Trash2 className="w-3 h-3" /> Clear</button>
                  </div>
                  {history.map((h, i) => (
                    <button key={`${h.query}-${i}`} onClick={() => { setQuery(h.query); searchWeather(h.query); }} className="w-full px-5 py-3 text-left hover:bg-white/10 flex items-center justify-between transition-all duration-200">
                      <span className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-white/25" /><span className="font-medium">{h.query}</span></span>
                      {h.temp !== undefined && <span className="text-white/40 text-sm font-medium">{h.temp}°C</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="px-6 sm:px-8 py-4 glass-premium text-white font-semibold hover:bg-white/25 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 hover-lift">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
          <div className="flex justify-end mt-3">
            <button onClick={() => setUnit(unit === "C" ? "F" : "C")} className="glass px-4 py-2 text-white/60 hover:text-white text-sm flex items-center gap-2 transition-all duration-300 hover:bg-white/15">
              <Thermometer className="w-4 h-4" /><span className="font-medium">°C</span><span className="text-white/30">/</span><span className={unit === "F" ? "text-white font-medium" : "text-white/40"}>°F</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="glass-card p-6 mb-8 text-center fade-in-up">
            <div className="text-4xl mb-3">😕</div>
            <p className="text-red-300/90 text-lg font-medium">{error}</p>
            <p className="text-white/40 mt-2 text-sm">Try searching for a different city</p>
          </div>
        )}

        {weather && weatherLoaded && (
          <div className="space-y-5 stagger-children">
            <div className="glass-card p-6 sm:p-8 hover-lift">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1"><MapPin className="w-5 h-5 text-white/50" /><h2 className="text-2xl sm:text-3xl font-display font-bold text-white">{weather.name}, {weather.sys.country}</h2></div>
                  <p className="text-white/50 capitalize text-lg font-light">{weather.weather[0]?.description}</p>
                  <p className="text-white/30 text-sm mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <div className="flex items-center gap-4">
                  <img src={`https://openweathermap.org/img/wn/${weather.weather[0]?.icon}@4x.png`} alt={weather.weather[0]?.description} className="w-28 h-28 -m-4 drop-shadow-lg" />
                  <div>
                    <div className="text-7xl sm:text-8xl font-display font-bold text-white leading-none tracking-tighter">{temp(weather.main.temp)}</div>
                    <div className="text-white/50 text-xl font-light mt-1">°{unit}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div className="flex items-center gap-2 text-white/50"><Thermometer className="w-4 h-4 text-blue-300/70" />Feels like: <span className="text-white font-medium">{tempLabel(weather.main.feels_like)}</span></div>
                  <div className="flex items-center gap-2 text-white/50"><CloudRain className="w-4 h-4 text-blue-300/70" />Low: <span className="text-white font-medium">{tempLabel(weather.main.temp_min)}</span></div>
                  <div className="flex items-center gap-2 text-white/50"><Thermometer className="w-4 h-4 text-orange-300/70" />High: <span className="text-white font-medium">{tempLabel(weather.main.temp_max)}</span></div>
                  <div className="flex items-center gap-2 text-white/50"><Droplets className="w-4 h-4 text-blue-300/70" />Humidity: <span className="text-white font-medium">{weather.main.humidity}%</span></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <DetailCard icon={<Wind className="w-6 h-6" />} label="Wind" value={`${weather.wind.speed} m/s`} sub={`${getWindDirection(weather.wind.deg)}${weather.wind.gust ? ` · gust ${weather.wind.gust}` : ""}`} color="text-sky-300" />
              <DetailCard icon={<Droplets className="w-6 h-6" />} label="Humidity" value={`${weather.main.humidity}%`} sub={weather.main.humidity > 70 ? "High" : weather.main.humidity < 30 ? "Low" : "Normal"} color="text-blue-300" />
              <DetailCard icon={<Eye className="w-6 h-6" />} label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} sub={weather.visibility > 10000 ? "Excellent" : weather.visibility > 5000 ? "Good" : "Poor"} color="text-emerald-300" />
              <DetailCard icon={<Gauge className="w-6 h-6" />} label="Pressure" value={`${weather.main.pressure} hPa`} sub={weather.main.pressure > 1020 ? "High" : weather.main.pressure < 1000 ? "Low" : "Normal"} color="text-violet-300" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="glass-card p-5 flex items-center gap-4 hover-lift">
                <div className="p-2.5 rounded-xl bg-yellow-400/15"><Sunrise className="w-7 h-7 text-yellow-300" /></div>
                <div><p className="text-white/40 text-sm font-light">Sunrise</p><p className="text-white font-display font-semibold text-xl">{formatTime(weather.sys.sunrise, weather.timezone)}</p></div>
              </div>
              <div className="glass-card p-5 flex items-center gap-4 hover-lift">
                <div className="p-2.5 rounded-xl bg-orange-400/15"><Sunset className="w-7 h-7 text-orange-300" /></div>
                <div><p className="text-white/40 text-sm font-light">Sunset</p><p className="text-white font-display font-semibold text-xl">{formatTime(weather.sys.sunset, weather.timezone)}</p></div>
              </div>
            </div>

            {hourlyForecast.length > 0 && (
              <div className="glass-card p-5 sm:p-6">
                <h3 className="text-white font-display font-semibold text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-white/50" /> Next 24 Hours</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {hourlyForecast.map((item, i) => (
                    <div key={item.dt} className={`flex flex-col items-center min-w-[85px] text-center p-3 rounded-xl transition-all duration-300 hover:bg-white/10 ${i === 0 ? "bg-white/10" : ""}`}>
                      <p className="text-white/40 text-xs font-medium">{i === 0 ? "Now" : formatTime(item.dt, forecast!.city.timezone)}</p>
                      <img src={`https://openweathermap.org/img/wn/${item.weather[0]?.icon}@2x.png`} alt={item.weather[0]?.description} className="w-12 h-12 -my-1" />
                      <p className="text-white font-display font-semibold">{tempLabel(item.main.temp)}</p>
                      <p className="text-blue-300/70 text-xs flex items-center gap-0.5 mt-0.5"><CloudRain className="w-3 h-3" />{Math.round(item.pop * 100)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dailyForecast.length > 0 && (
              <div className="glass-card p-5 sm:p-6">
                <h3 className="text-white font-display font-semibold text-lg mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-white/50" /> 5-Day Forecast</h3>
                <div className="space-y-2">
                  {dailyForecast.map((item) => (
                    <div key={item.dt} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/5 transition-all duration-200">
                      <div className="flex items-center gap-3 min-w-[130px]">
                        <img src={`https://openweathermap.org/img/wn/${item.weather[0]?.icon}@2x.png`} alt={item.weather[0]?.description} className="w-10 h-10" />
                        <div><p className="text-white font-medium text-sm">{formatDate(item.dt, forecast!.city.timezone)}</p><p className="text-white/40 text-xs capitalize">{item.weather[0]?.description}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-blue-300/60 text-xs flex items-center gap-1"><CloudRain className="w-3 h-3" />{Math.round(item.pop * 100)}%</span>
                        <span className="text-white/40 text-sm w-12 text-right">{tempLabel(item.main.temp_min)}</span>
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full temp-bar rounded-full" style={{ width: `${Math.min(100, Math.max(25, ((temp(item.main.temp_max) - temp(item.main.temp_min)) / 30) * 100))}%` }} /></div>
                        <span className="text-white font-medium text-sm w-12">{tempLabel(item.main.temp_max)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass p-4 text-center text-white/25 text-xs font-light">
              <Navigation className="w-3.5 h-3.5 inline mr-1" />{weather.coord.lat.toFixed(4)}°, {weather.coord.lon.toFixed(4)}° · UTC{weather.timezone >= 0 ? "+" : ""}{weather.timezone / 3600}h
            </div>
          </div>
        )}

        {loading && !weather && (
          <div className="glass-card p-12 text-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/50 font-light">Fetching weather data...</p>
          </div>
        )}

        {!weather && !loading && !error && (
          <div className="glass-card p-10 sm:p-14 text-center pulse-glow">
            <div className="text-7xl mb-5">🌍</div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">Discover the Weather</h2>
            <p className="text-white/50 max-w-md mx-auto text-base font-light leading-relaxed">Search any city worldwide for real-time conditions, hourly forecasts, and a 5-day outlook.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {["London", "Tokyo", "New York", "Paris", "Sydney", "Dubai"].map((city) => (
                <button key={city} onClick={() => { setQuery(city); searchWeather(city); }} className="glass px-5 py-2.5 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 text-sm font-medium hover-lift">{city}</button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-10 text-white/20 text-xs font-light">
          <p>Powered by OpenWeatherMap · Built with Next.js & Tailwind CSS</p>
        </div>
      </div>
    </main>
  );
}

function DetailCard({ icon, label, value, sub, color = "text-white/60" }: { icon: React.ReactNode; label: string; value: string; sub: string; color?: string }) {
  return (
    <div className="glass-card p-4 sm:p-5 text-center hover-lift group">
      <div className={`flex items-center justify-center gap-2 ${color} mb-2.5 transition-colors group-hover:scale-110 duration-300`}>{icon}</div>
      <p className="text-white font-display font-semibold text-lg">{value}</p>
      <p className="text-white/30 text-xs mt-0.5 font-light">{label}</p>
      <p className="text-white/40 text-xs mt-1">{sub}</p>
    </div>
  );
}