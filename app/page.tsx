
"use client";
import Image from 'next/image';
import { useState, FormEvent } from 'react';

interface ForecastDay {
  date: string;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-blue-400 flex flex-col items-center px-4 py-12">
      {/* Search Box */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col sm:flex-row items-center gap-4 mb-8"
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
          className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="text-red-700 bg-red-100 px-4 py-2 rounded-lg mb-4 w-full max-w-md text-center">
          {error}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-blue-800 font-semibold text-lg">Loading...</p>
      )}

      {/* Weather Info */}
      {weatherData && !loading && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 text-center">
          {/* City Info */}
          <h2 className="text-3xl font-bold text-blue-700">
            {weatherData.location.name}, {weatherData.location.country}
          </h2>
          <p className="text-gray-500 mt-1">{weatherData.location.localtime}</p>

          {/* Icon + Temp */}
          <div className="flex flex-col items-center mt-6">
            <Image
              src={`https:${weatherData.current.condition.icon}`}
              width={96}
              height={96}
              alt="Weather Icon"
              className="drop-shadow-md"
            />
            <h1 className="text-5xl font-bold mt-2">{weatherData.current.temp_c}°C</h1>
            <p className="text-xl text-gray-700 mt-1">{weatherData.current.condition.text}</p>
          </div>

          {/* Weather Stats */}
          <div className="grid grid-cols-2 gap-4 mt-8 text-left text-sm sm:text-base">
            <div>
              <p className="font-medium text-gray-600">Humidity</p>
              <p className="text-blue-600 font-semibold">{weatherData.current.humidity}%</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Wind Speed</p>
              <p className="text-blue-600 font-semibold">{weatherData.current.wind_mph} mph</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Pressure</p>
              <p className="text-blue-600 font-semibold">{weatherData.current.pressure_mb} mb</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Visibility</p>
              <p className="text-blue-600 font-semibold">{weatherData.current.vis_km} km</p>
            </div>
          </div>

          {/* Forecast */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Next 3 Days Forecast</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {weatherData.forecast.forecastday.map((day) => (
                <div key={day.date} className="bg-blue-50 p-4 rounded-lg text-center shadow">
                  <p className="text-gray-600 font-medium mb-2">{day.date}</p>
                  <Image
                    src={`https:${day.day.condition.icon}`}
                    width={48}
                    height={48}
                    alt={day.day.condition.text}
                    className="mx-auto"
                  />
                  <p className="text-gray-800 mt-1 text-sm">{day.day.condition.text}</p>
                  <p className="text-blue-700 font-bold">{day.day.maxtemp_c}° / {day.day.mintemp_c}°C</p>
                  {/* Rain Forecast */}
                  <p className="text-blue-600  mt-2">
                    Rain: {day.day.totalprecip_mm} mm
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
