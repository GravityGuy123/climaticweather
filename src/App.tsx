import React, { useState, useEffect, useRef } from "react";
import citiesWithCountry from "./citiesWithCountry.json";
import nigeriaStates from "./nigeriaStates.json";
import './App.css';
import Header from "./components/Header";
import CityInput from "./components/CityInput";
import ErrorMessage from "./components/ErrorMessage";
import Loading from "./components/Loading";
import WeatherCard from "./components/WeatherCard";



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
        <Header />
        <CityInput
          city={city}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          inputRef={inputRef}
          loading={loading}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          onSuggestionClick={handleSuggestionClick}
        />
        <div className="w-full mt-4 min-h-[32px] flex items-center justify-center">
          {error && <ErrorMessage error={error} />}
          {loading && <Loading />}
        </div>
        {weather && <WeatherCard weather={weather} city={city} />}
      </div>
    </div>
  );
}

export default App
