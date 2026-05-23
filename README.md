# Wealther — Premium Weather App

A beautifully designed Next.js weather application with real-time data from OpenWeatherMap API, animated weather effects, and a premium user experience.

## ✨ Features

- 🔍 **Smart City Search** — Autocomplete suggestions with search history
- 🌡️ **Current Conditions** — Temperature, feels-like, min/max, humidity, wind, visibility, pressure
- ⏱️ **Hourly Forecast** — Next 24 hours with precipitation probability
- 📅 **5-Day Forecast** — Daily outlook with temperature range bars
- 🌅 **Sunrise & Sunset** — Local times adjusted for timezone
- 🎨 **Animated Weather Effects** — Rain drops, snowflakes, drifting clouds, and lightning flashes
- 🔄 **Search History** — Recent searches saved in localStorage
- 🌡️ **Unit Toggle** — Switch between Celsius and Fahrenheit
- 🖼️ **Dynamic Backgrounds** — Gradient changes based on weather conditions
- ✨ **Premium Design** — Glassmorphism cards, hover effects, smooth animations
- 📱 **Responsive Design** — Optimized for mobile, tablet, and desktop

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- An OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org/api))

### Installation

```bash
# Clone the repository
git clone https://github.com/understandingx/Akicode-OS.git
cd Akicode-OS

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your OpenWeatherMap API key

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENWEATHER_API_KEY` | Your OpenWeatherMap API key | Yes |

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Fonts:** Space Grotesk + Inter (Google Fonts)
- **Icons:** Lucide React
- **API:** OpenWeatherMap (free tier)

## 📁 Project Structure

```
├── src/
│   └── app/
│       ├── api/
│       │   └── weather/
│       │       └── route.ts    # API proxy for OpenWeatherMap
│       ├── globals.css          # Global styles + animations + glass utilities
│       ├── layout.tsx          # Root layout with premium fonts
│       ├── page.tsx            # Main weather UI
│       ├── types.ts            # TypeScript interfaces
│       └── utils.ts            # Helper functions + animation types
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 📄 License

MIT