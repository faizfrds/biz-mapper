import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import MapContainer from './components/MapContainer';
import ThinkingLog from './components/ThinkingLog';
import { useQuery } from './hooks/useQuery';

function App() {
  const { query, results, thoughts, isLoading, error, submitQuery } = useQuery();
  const [selectedResult, setSelectedResult] = useState(null);

  const handleQuery = (userPrompt) => {
    setSelectedResult(null);
    submitQuery(userPrompt);
  };

  return (
    <div className="flex h-screen w-full bg-dark-900 text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar - Thinking Log */}
      <div className="w-80 md:w-96 flex-shrink-0 border-r border-slate-700/50 bg-dark-800/80 backdrop-blur-xl flex flex-col z-10 shadow-xl shadow-black/20">
        <div className="p-4 border-b border-slate-700/50 bg-dark-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-100 to-brand-400">Biz-Mapper</h1>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-brand-900/50 text-brand-400 font-medium border border-brand-500/20">Agentic</span>
        </div>
        
        <ThinkingLog thoughts={thoughts} isLoading={isLoading} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        {/* Search Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-dark-900/80 to-transparent pointer-events-none">
          <div className="pointer-events-auto max-w-3xl mx-auto">
            <SearchBar onSearch={handleQuery} isLoading={isLoading} />
          </div>
        </div>

        {/* Full screen maps container */}
        <div className="flex-1 w-full h-full relative z-0">
          <MapContainer 
            results={results} 
            selectedResult={selectedResult}
            onSelectResult={setSelectedResult}
          />
        </div>
        
        {/* Results drawer/cards (mobile support) */}
        {results.length > 0 && (
          <div className="absolute bottom-6 left-0 right-0 z-10 px-6 pointer-events-none">
            <div className="pointer-events-auto flex overflow-x-auto gap-4 pb-4 snap-x ml-auto mr-auto max-w-5xl">
              {results.map(r => (
                <div 
                  key={r.id || r.rank} 
                  onClick={() => setSelectedResult(r)}
                  className={`snap-center flex-shrink-0 w-80 p-4 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                    selectedResult?.id === r.id 
                      ? 'bg-brand-900/80 border-brand-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
                      : 'bg-dark-800/90 border-slate-700/60 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">Rank {r.rank}</h3>
                    <div className="bg-neon/20 text-neon px-2 py-0.5 rounded text-xs font-bold border border-neon/30">
                      Score: {r.score}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-3">{r.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
