import React, { useEffect, useRef } from 'react';

export default function ThinkingLog({ thoughts, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thoughts]);

  const getIcon = (type) => {
<<<<<<< Updated upstream
    switch(type) {
      case 'search':
         return <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400"><span className="text-xs border-blue-400">🔍</span></div>;
      case 'data':
         return <div className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-500/20 text-purple-400"><span className="text-xs">📊</span></div>;
      case 'calc':
         return <div className="w-6 h-6 flex items-center justify-center rounded-full bg-neon/20 text-neon"><span className="text-xs">🧮</span></div>;
      default:
         return <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-500/20 text-slate-400"><span className="text-xs">🤖</span></div>;
    }
=======
    // If from ADK backend, type is in 'status' field typically, or 'agent'
    const str = (type || '').toLowerCase();
    
    if (str.includes('search') || str.includes('strategist')) {
       return <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400"><span className="text-xs border-blue-400">🔍</span></div>;
    }
    if (str.includes('data') || str.includes('analyst') || str.includes('sql')) {
       return <div className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-500/20 text-purple-400"><span className="text-xs">📊</span></div>;
    }
    if (str.includes('calc') || str.includes('score') || str.includes('cartographer')) {
       return <div className="w-6 h-6 flex items-center justify-center rounded-full bg-neon/20 text-neon"><span className="text-xs">🧮</span></div>;
    }
    
    return <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-500/20 text-slate-400"><span className="text-xs">🤖</span></div>;
>>>>>>> Stashed changes
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      
      {thoughts.length === 0 && !isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-6">
          <svg className="w-12 h-12 mb-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p className="text-sm">Agent is standing by.</p>
          <p className="text-xs text-slate-600 mt-2">Enter a business goal to begin the site selection process.</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700/50 before:to-transparent">
        
<<<<<<< Updated upstream
        {thoughts.map((t, idx) => (
          <div key={t.id || idx} className="relative flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute left-0 w-6 flex items-center justify-center z-10 bg-dark-800">
              {getIcon(t.type)}
            </div>
            <div className="ml-10 flex-1">
              <div className="bg-dark-900 border border-slate-700/50 p-3 rounded-lg rounded-tl-none shadow-sm flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {t.timestamp} • {t.type}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {t.text}
=======
        {thoughts.map((t, idx) => {
          // Normalizing ADK response log vs legacy mock logic
          const time = t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : '';
          const category = t.agent ? `${t.agent} • ${t.status}` : `${t.type}`;
          const isError = t.status === 'error';
          
          return (
          <div key={idx} className="relative flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute left-0 w-6 flex items-center justify-center z-10 bg-dark-800">
              {isError ? getIcon('error') : getIcon(t.agent || t.type)}
            </div>
            <div className="ml-10 flex-1">
              <div className={`bg-dark-900 border ${isError ? 'border-red-900/50' : 'border-slate-700/50'} p-3 rounded-lg rounded-tl-none shadow-sm flex flex-col gap-1`}>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isError ? 'text-red-500' : 'text-slate-500'}`}>
                  {time} {time && '•'} {category}
                </span>
                <p className={`text-sm ${isError ? 'text-red-200' : 'text-slate-300'} leading-relaxed`}>
                  {t.message || t.text}
>>>>>>> Stashed changes
                </p>
              </div>
            </div>
          </div>
<<<<<<< Updated upstream
        ))}
=======
        )})}
>>>>>>> Stashed changes
        
        {isLoading && thoughts.length > 0 && (
          <div className="relative flex items-center gap-4 py-2 animate-pulse">
             <div className="absolute left-0 w-6 flex items-center justify-center z-10 bg-dark-800">
              <div className="w-4 h-4 rounded-full bg-brand-500/50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-brand-400"></div>
              </div>
            </div>
            <div className="ml-10 text-xs text-brand-400 font-medium tracking-wide">
              Agent is reasoning...
            </div>
          </div>
        )}
      </div>

      <div ref={bottomRef} className="h-4 flex-shrink-0" />
    </div>
  );
}
