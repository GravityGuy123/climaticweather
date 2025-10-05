import React, { useState, useEffect, useRef } from "react";
import nigeriaLocations from "./data/nigeriaLocations.json";
import globalCities from "./data/globalCities.json";
import "./App.css";
import Header from "./components/Header";
import CityInput from "./components/CityInput";
import ErrorMessage from "./components/ErrorMessage";
import Loading from "./components/Loading";
import WeatherCard from "./components/WeatherCard";

interface WeatherData {
  name: string;
  main: { temp: number; humidity: number };
  weather: { description: string; icon: string }[];
  wind?: { speed?: number; deg?: number };
  sys?: { country?: string; sunrise?: number; sunset?: number };
}

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ display: string; search: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  // --- Generate suggestions ---
  useEffect(() => {
    if (city.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const input = city.trim().toLowerCase();

    // Nigeria matches
    const nigeriaMatches = (nigeriaLocations as Array<{ name: string; state: string; country: string }>).filter(
      (loc) =>
        loc.name.toLowerCase().startsWith(input) ||
        loc.state.toLowerCase().startsWith(input)
    ).map((loc) => ({
      display: `${loc.name}, ${loc.state}, ${loc.country}`,
      search: `${loc.name}, ${loc.country}`,
    }));

    // Global matches
    const globalMatches = (globalCities as Array<{ name: string; country: string }>).filter(
      (cityObj) => cityObj.name.toLowerCase().startsWith(input)
    ).map((cityObj) => ({
      display: `${cityObj.name}, ${cityObj.country}`,
      search: `${cityObj.name}, ${cityObj.country}`,
    }));

    setSuggestions([...nigeriaMatches, ...globalMatches].slice(0, 10));
    setShowSuggestions(true);
  }, [city]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    setShowSuggestions(true);
  };

  // --- Handle suggestion click ---
  const handleSuggestionClick = async (suggestionObj: { display: string; search: string }) => {
    setCity(suggestionObj.display);
    setShowSuggestions(false);
    if (inputRef.current) inputRef.current.blur();
    await fetchWeather(suggestionObj.search, suggestionObj.display);
  };

  // --- Handle form submit ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }
    await fetchWeather(city.trim());
  };

  // --- Fetch weather using Geo API + fallback to nigeriaLocations ---
  const fetchWeather = async (query: string, displayOverride?: string) => {
    setError("");
    setWeather(null);
    setLoading(true);

    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${apiKey}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (!geoData.length) throw new Error("City not found or API error.");

      const { lat, lon, name, state, country } = geoData[0];

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const weatherRes = await fetch(weatherUrl);
      const data = await weatherRes.json();

      if (data.cod !== 200) throw new Error(data.message || "City not found or API error.");

      // --- Build full display name ---
      let cityDisplay = displayOverride;
      if (!cityDisplay) {
        const nigeriaMatch = nigeriaLocations.find(
          (loc) => loc.name.toLowerCase() === name.toLowerCase()
        );
        const stateName = state || nigeriaMatch?.state || "";
        const countryName = country || nigeriaMatch?.country || "";

        cityDisplay = `${name}${stateName ? `, ${stateName}` : ""}${
          countryName ? `, ${countryName}` : ""
        }`;
      }

      setCity(cityDisplay);
      setWeather(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // --- Hide suggestions on outside click ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-amber-100 to-red-100 flex flex-col items-center justify-start py-8 px-2">
      <div className="w-full max-w-md bg-white/80 rounded-xl shadow-lg p-6 flex flex-col items-center relative">
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

export default App;