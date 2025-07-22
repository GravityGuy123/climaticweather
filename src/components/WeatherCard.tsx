import React from "react";
import nigeriaStates from "../nigeriaStates.json";

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

const WeatherCard: React.FC<{ weather: WeatherData; city: string }> = ({ weather, city }) => {
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
};

export default WeatherCard;
