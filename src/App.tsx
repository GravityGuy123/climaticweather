

import React, { useState, useEffect, useRef } from "react";
import citiesWithCountry from "./citiesWithCountry.json";
import nigeriaStates from "./nigeriaStates.json";
import './App.css';



interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: { description: string; icon: string }[];
  wind?: {
    speed?: number;
    deg?: number;
  };
  sys?: {
    country?: string;
    sunrise?: number;
    sunset?: number;
  };
}

function App() {
  const [city, setCity] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<{ display: string; search: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (city.trim().length > 0) {
      const cityOptions = (citiesWithCountry as Array<{ name: string; country: string }>);
      const citySuggestions = cityOptions
        .filter(c => c.name.toLowerCase().startsWith(city.trim().toLowerCase()))
        .map(c => ({ display: `${c.name}, ${c.country}`, search: `${c.name}, ${c.country}` }));

      const stateOptions = (nigeriaStates as string[]);
      const stateSuggestions = stateOptions
        .filter(s => s.toLowerCase().startsWith(city.trim().toLowerCase()))
        .map(s => ({ display: `${s}, Nigeria`, search: `${s}, Nigeria` }));

      let allStateSuggestions: { display: string; search: string }[] = [];
      if (city.trim().toLowerCase() === 'nigeria') {
        allStateSuggestions = stateOptions.map(s => ({ display: `${s}, Nigeria`, search: `${s}, Nigeria` }));
      }

      const allSuggestions = [...citySuggestions, ...stateSuggestions, ...allStateSuggestions];
      setSuggestions(allSuggestions.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [city]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = async (suggestionObj: { display: string; search: string }) => {
    setCity(suggestionObj.display);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
    setError("");
    setWeather(null);
    setLoading(true);
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(suggestionObj.search)}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error("City not found or API error.");
      }
      const data = await response.json();
      setWeather(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Optional: close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setWeather(null);
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }
    setLoading(true);
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    // If city is a Nigerian state, append ', Nigeria'
    const isNigeriaState = (nigeriaStates as string[]).some(
      s => s.toLowerCase() === city.split(',')[0].trim().toLowerCase()
    );
    const query = isNigeriaState ? `${city.split(',')[0].trim()}, Nigeria` : city;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error("City not found or API error.");
      }
      const data = await response.json();
      setWeather(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-amber-100 to-red-100 flex flex-col items-center justify-start py-8 px-2">
      <div className="w-full max-w-md bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-4 tracking-tight drop-shadow typewriter-heading">Climatic Weather</h2>
        <form onSubmit={handleSubmit} autoComplete="off" className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="city" className="text-lg font-semibold text-gray-700">City or State</label>
            <input className="p-3 bg-gray-100 text-gray-900 placeholder-gray-400 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" type="text" id="city" value={city} onChange={handleInputChange} placeholder="Enter city or state name" ref={inputRef} autoComplete="off" />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={loading}>Search</button>
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto w-full">
              {suggestions.map((suggestionObj) => (
                <li
                  key={suggestionObj.display}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-gray-800"
                  onMouseDown={e => {
                    e.preventDefault();
                    handleSuggestionClick(suggestionObj);
                  }}
                  tabIndex={0}
                  aria-label={`Search weather for ${suggestionObj.display}`}
                >
                  {suggestionObj.display}
                </li>
              ))}
            </ul>
          )}
        </form>
        <div className="w-full mt-4 min-h-[32px] flex items-center justify-center">
          {error && <span className="text-red-600 font-semibold text-center">{error}</span>}
          {loading && <div className="text-blue-600 font-semibold">Loading...</div>}
        </div>
        {weather && (() => {
          const temp = weather.main.temp;
          let bgColor = "bg-white";
          let tempMsg = "";
          if (temp < 18) {
            bgColor = "bg-blue-100";
            tempMsg = "It's cold.";
          } else if (temp >= 18 && temp < 28) {
            bgColor = "bg-yellow-100";
            tempMsg = "It's warm.";
          } else if (temp >= 28) {
            bgColor = "bg-red-100";
            tempMsg = "It's hot.";
          }
          const description = weather.weather[0].description.toLowerCase();
          let conditionMsg = "";
          if (description.includes("rain")) {
            conditionMsg = "It's going to rain.";
          } else if (description.includes("sun") || description.includes("clear")) {
            conditionMsg = "It's sunny.";
          } else if (description.includes("cloud")) {
            conditionMsg = "It's cloudy.";
          } else if (description.includes("storm")) {
            conditionMsg = "There might be a storm.";
          } else if (description.includes("snow")) {
            conditionMsg = "It might snow.";
          } else {
            conditionMsg = `Weather: ${weather.weather[0].description}`;
          }
          const windSpeed = weather.wind?.speed;
          const windDeg = weather.wind?.deg;
          let windMsg = "";
          if (windSpeed !== undefined) {
            windMsg = `Wind: ${windSpeed} m/s`;
            if (windDeg !== undefined) {
              const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
              const idx = Math.round(windDeg / 45) % 8;
              windMsg += ` (${directions[idx]})`;
            }
          }
          let sunriseMsg = "";
          let sunsetMsg = "";
          if (weather.sys?.sunrise && weather.sys?.sunset) {
            const sunrise = new Date(weather.sys.sunrise * 1000);
            const sunset = new Date(weather.sys.sunset * 1000);
            sunriseMsg = `Sunrise: ${sunrise.toLocaleTimeString()}`;
            sunsetMsg = `Sunset: ${sunset.toLocaleTimeString()}`;
          }
          let cityCountry = weather.name;
          const isNigeriaState = (nigeriaStates as string[]).some(
            s => s.toLowerCase() === city.split(',')[0].trim().toLowerCase()
          );
          if (isNigeriaState) {
            cityCountry += ', Nigeria';
          } else if (weather.sys?.country) {
            cityCountry += `, ${weather.sys.country === 'NG' ? 'Nigeria' : weather.sys.country}`;
          }
          return (
            <div className={`w-full mt-2 p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 transition ${bgColor}`}>
              <h3 className="text-2xl font-bold text-blue-700 mb-2 drop-shadow">{cityCountry}</h3>
              <img className="w-24 h-24 mb-2" src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt={weather.weather[0].description} />
              <p className="text-lg font-semibold text-gray-800">Temperature: {weather.main.temp}°C</p>
              <p className="text-gray-700 italic">{tempMsg}</p>
              <p className="text-gray-700">Humidity: {weather.main.humidity}%</p>
              <p className="text-gray-700">{conditionMsg}</p>
              {windMsg && <p className="text-gray-700">{windMsg}</p>}
              {sunriseMsg && <p className="text-gray-700">{sunriseMsg}</p>}
              {sunsetMsg && <p className="text-gray-700">{sunsetMsg}</p>}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default App
