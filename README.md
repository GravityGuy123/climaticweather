## Weather App with City Suggestions (Vite + React + TypeScript)

This project is a weather application built with Vite, React, and TypeScript. It allows users to search for weather information by city, providing real-time city suggestions as they type.

---

### Key Features
*   **City Search:** Users can type in a city name to search for weather information.
*   **Real-time Suggestions:** As the user types, the app provides suggestions for cities matching the input.
*   **Weather Display:** The app displays relevant weather information for the selected city, such as temperature and description.

---

### 1. Prerequisites
Before you begin, ensure you have the following installed:
*   Node.js
*   npm or yarn

### 2. Getting Started

#### 2.1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-name>
```

#### 2.2. Install Dependencies
```bash
npm install # or yarn install
```

#### 2.3. Set Up the API Key
*   Sign up at [OpenWeatherMap](https://openweathermap.org/) or a similar service and obtain your API key.
*   Create a file at `src/apiKey.tsx`:
  ```ts
  // src/apiKey.tsx
  export const API_KEY = "YOUR_API_KEY_HERE";
  ```

### 3. Add a List of Cities
- Download a city list (e.g., from [SimpleMaps](https://simplemaps.com/data/world-cities) or use a small sample for testing).
- Save it as `src/cities.json`. Example:
  ```json
  ["London", "Lagos", "Los Angeles", "Lisbon", "Lima", "Lille", "Ludhiana"]
  ```

### 4. Design the UI
- In `App.tsx`, add:
  - A search input for city names
  - A dropdown for city suggestions
  - A button to search
  - A section to display weather info

### 5. Manage State
- Use React's `useState` for:
  - `inputValue`: the current value of the search input
  - `suggestions`: filtered city suggestions
  - `selectedCity`: the city to search
  - `weatherData`: the fetched weather info
  - `loading` and `error` states

### 6. Implement City Suggestions
- On every input change:
  - Filter `cities.json` for cities that start with the input value (case-insensitive)
  - Show the filtered list as suggestions
- On suggestion click:
  - Set the input value to the selected city
  - Optionally, trigger the weather search

### 7. Fetch Weather Data
- On search (button click or Enter):
  - Use `fetch` to call the weather API:
    ```ts
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=${API_KEY}&units=metric`)
    ```
  - Parse and store the result in `weatherData`
  - Handle loading and error states

### 8. Display Results
- Show weather info (temperature, description, etc.) if available
- Show loading or error messages as needed

### 9. Style the App
- Use `App.css` or `index.css` for a clean, modern look
- Style the input, suggestions dropdown, and weather display

### 10. Test
- Try searching for different cities
- Handle edge cases (invalid city, API errors, empty input)

---

#### Example Component Structure (App.tsx)

```tsx
import React, { useState } from "react";
import { API_KEY } from "./apiKey";
import cities from "./cities.json";

// ...component code for input, suggestions, fetch, and display...
```

---

#### Tips
- For large city lists, consider debouncing input and limiting suggestions.
- You can use TypeScript interfaces for weather data and city types.
- For better UX, close suggestions when clicking outside or after selection.

---

You’re ready to build your weather app! 🎉