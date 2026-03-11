import React, { useState } from 'react';

export default function SearchBar({ onSearch, isLoading }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSearch(prompt);
  };

  const suggestions = [
    "Sourdough bakery in Seattle with high foot traffic",
    "Quiet cafe in Portland near parks",
    "Boutique gym in Austin with high income demographic"
  ];

  return (
    <div className="w-full relative">
      <form 
        onSubmit={handleSubmit}
        className="relative group flex items-center bg-dark-800/90 backdrop-blur-xl rounded-2xl p-2 pl-4 border border-slate-700/60 shadow-2xl focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all duration-300"
      >
        <svg 
          className={`w-6 h-6 mr-3 transition-colors ${isLoading ? 'text-brand-400 animate-pulse' : 'text-slate-400 group-focus-within:text-brand-400'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {isLoading ? (
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          )}
        </svg>
        <input
          type="text"
          className="flex-1 bg-transparent border-none text-slate-100 font-medium placeholder-slate-500 focus:outline-none focus:ring-0"
          placeholder="Describe your ideal business location..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="ml-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-brand-600/20"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking
            </span>
          ) : 'Analyze'}
        </button>
      </form>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 mt-4 px-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => setPrompt(suggestion)}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-dark-800 border border-slate-700 hover:border-brand-500 hover:text-brand-300 transition-colors text-slate-400"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
