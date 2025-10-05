import React from "react";

interface Suggestion {
  display: string;
  search: string;
}

interface CityInputProps {
  city: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  loading: boolean;
  suggestions: Suggestion[];
  showSuggestions: boolean;
  onSuggestionClick: (suggestion: Suggestion) => void;
}

const CityInput: React.FC<CityInputProps> = ({
  city,
  onChange,
  onSubmit,
  inputRef,
  loading,
  suggestions,
  showSuggestions,
  onSuggestionClick,
}) => (
  <form onSubmit={onSubmit} autoComplete="off" className="w-full flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <label htmlFor="city" className="text-lg font-semibold text-gray-700">City or State</label>
      <input
        className="p-3 bg-gray-100 text-gray-900 placeholder-gray-400 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        type="text"
        id="city"
        value={city}
        onChange={onChange}
        placeholder="Enter city or state name"
        ref={inputRef}
        autoComplete="off"
      />
    </div>
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      type="submit"
      disabled={loading}
    >
      Search
    </button>
    {showSuggestions && suggestions.length > 0 && (
      <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto w-full">
        {suggestions.map((suggestionObj) => (
          <li
            key={suggestionObj.display}
            className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-gray-800"
            onMouseDown={e => {
              e.preventDefault();
              onSuggestionClick(suggestionObj);
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
);

export default CityInput;
