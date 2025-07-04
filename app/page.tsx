
"use client";
import Image from 'next/image';
import { useState, FormEvent } from 'react';

interface HourlyForecast {
  time: string;
  temp_c: number;
  condition: {
    icon: string;
    text: string;
  };
}

interface ForecastDay {
  date: string;
  hour: HourlyForecast[];
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    totalprecip_mm: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

interface WeatherData {
  location: {
    name: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    humidity: number;
    wind_mph: number;
    pressure_mb: number;
    vis_km: number;
    condition: {
      text: string;
      icon: string;
    };
  };
  forecast: {
    forecastday: ForecastDay[];
  };
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchWeather(city: string) {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=fc677a2273c843bcb5150539252804&q=${city}&days=3`
      );
      const data = await res.json();
      if (data.error) {
        setWeatherData(null);
        setError(data.error.message || 'City not found');
      } else {
        setWeatherData(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Something went wrong. Please try again.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = searchCity.trim();
    if (trimmed) {
      fetchWeather(trimmed);
      setSearchCity('');
    }
  }

  return (
    <div className="min-h-screen bg-[url('/rain-bg.jpg')] bg-cover bg-center text-white px-4 py-8">
      {/* Main container with different layouts based on weather data */}
      <div className={`max-w-6xl mx-auto ${weatherData ? '' : 'flex flex-col items-center justify-center min-h-[70vh]'}`}>
        {/* Search form - always centered when no data, top when data exists */}
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-md flex flex-col sm:flex-row items-center gap-4 ${weatherData ? 'mb-8' : 'mb-0'}`}
        >
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Enter city name"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition w-full sm:w-auto"
          >
            Search
          </button>
        </form>

        {/* Error message */}
        {error && (
          <p className="text-red-700 bg-red-100 px-4 py-2 rounded-lg mb-4 w-full max-w-md text-center">
            {error}
          </p>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="w-full flex justify-center py-8">
            <p className="text-blue-800 font-semibold text-lg">Loading...</p>
          </div>
        )}

        {/* Weather data display */}
        {weatherData &&!loading && (
          <div className="grid lg:grid-cols-3 gap-6 bg-black/30 backdrop-blur-lg rounded-3xl p-6 shadow-lg mt-4">
            {/* LEFT COLUMN - MAIN WEATHER */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Location & Time */}
              <div className="bg-black/40 p-6 rounded-2xl">
                <h2 className="text-2xl font-semibold">{weatherData.location.name}, {weatherData.location.country}</h2>
                <p className="text-sm text-gray-300">{weatherData.location.localtime}</p>
              </div>

              {/* Temperature & Summary */}
              <div className="bg-black/40 p-6 rounded-2xl text-center">
                {weatherData.current.condition.icon && (
                  <Image
                    src={`https:${weatherData.current.condition.icon}`}
                    width={80}
                    height={80}
                    alt="Weather Icon"
                    className="mx-auto"
                  />
                )}
                <h1 className="text-5xl font-bold mt-2">{weatherData.current.temp_c}°</h1>
                <p className="text-xl">{weatherData.current.condition.text}</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Feels Like</p>
                  <p className="text-xl font-semibold">{weatherData.current.temp_c}°</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Humidity</p>
                  <p className="text-xl font-semibold">{weatherData.current.humidity}%</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Visibility</p>
                  <p className="text-xl font-semibold">{weatherData.current.vis_km} km</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Pressure</p>
                  <p className="text-xl font-semibold">{weatherData.current.pressure_mb} mb</p>
                </div>
              </div>
            </div>

            {/* CENTER - HOURLY FORECAST */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Hourly Forecast */}
              <div className="bg-black/40 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4">Hourly Forecast</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {[15, 16, 17, 18, 19].map((hour) => {
                    const hourData = weatherData.forecast.forecastday[0].hour[hour];
                    return (
                      <div key={hour} className="min-w-[90px] text-center bg-black/30 p-4 rounded-xl">
                        <p className="text-sm">{hour}:00</p>
                        {hourData?.condition?.icon && (
                          <Image 
                            src={`https:${hourData.condition.icon}`} 
                            width={40} 
                            height={40} 
                            alt="hourly" 
                            className="mx-auto" 
                          />
                        )}
                        <p className="text-lg font-medium">{hourData?.temp_c}°</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3-Day Forecast */}
              <div className="bg-black/40 p-6 rounded-2xl">
              
                <h3 className="text-lg font-semibold mb-4">3-Day Forecast</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {weatherData.forecast.forecastday.map((day) => (
                    <div key={day.date} className="bg-black/30 p-4 rounded-xl text-center">
                      <p className="text-sm text-gray-300">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      {day.day.condition.icon && (
                        <Image 
                          src={`https:${day.day.condition.icon}`} 
                          width={40} 
                          height={40} 
                          alt="forecast" 
                          className="mx-auto" 
                        />
                      )}
                      <p className="text-sm">{day.day.condition.text}</p>
                      <p className="text-lg font-semibold">{day.day.maxtemp_c}° / {day.day.mintemp_c}°</p>
                      <p className="text-sm text-blue-400 mt-1">Rain: {day.day.totalprecip_mm} mm</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* UV Index & Wind */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-xl">
                  <p className="text-sm text-gray-400">UV Index</p>
                  <p className="text-xl font-bold">3 <span className="text-yellow-400">Moderate</span></p>
                  <div className="h-2 mt-2 bg-gradient-to-r from-green-400 via-yellow-400 to-pink-500 rounded-full" />
                  <p className="text-xs mt-1 text-gray-400">Use sun protection until 16:00</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Wind</p>
                  <p className="text-xl font-bold">{weatherData.current.wind_mph} MPH</p>
                  <p className="text-sm text-gray-400 mt-1">Gusts: 9 MPH</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="text-center mt-8 text-sm text-white/70">
        <p className="mb-1">All Rights Reserved &copy; Ghulam Shabbir</p>
        <p className="text-yellow-400">Developed by Ghulam Shabbir</p>
      </footer>
    </div>
  );
}
