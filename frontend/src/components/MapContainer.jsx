import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

export default function MapContainer({ results, selectedResult, onSelectResult }) {
  // Center defaults to continental US
  const defaultCenter = { lat: 39.8283, lng: -98.5795 };
  const defaultZoom = 4;

  // If there are results, center on the top result
  const [mapCenter, setMapCenter] = useState(results && results.length > 0 
    ? { lat: Number(results[0].lat), lng: Number(results[0].lng) } 
    : defaultCenter);
  const [mapZoom, setMapZoom] = useState(results && results.length > 0 ? 12 : defaultZoom);
  
  const zoom = results && results.length > 0 ? 12 : defaultZoom;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-dark-900 flex items-center justify-center">
        <div className="text-center p-8 bg-dark-800 rounded-xl border border-red-900/50 shadow-2xl max-w-md">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-slate-200 mb-2">Maps API Key Missing</h2>
          <p className="text-sm text-slate-400">
            Please add <code className="bg-dark-900 px-1 py-0.5 rounded text-brand-400">GOOGLE_MAPS_API_KEY</code> to your .env file in the root directory.
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={mapCenter}
        defaultZoom={mapZoom}
        mapId="DEMO_MAP_ID" // Required for AdvancedMarker
        disableDefaultUI={false}
        className="w-full h-full"
      >
        {results && results.map((result, index) => {
          const isSelected = selectedResult?.id === result.id;
          return (
            <React.Fragment key={result.id || index}>
              <AdvancedMarker
                position={{ lat: result.lat, lng: result.lng }}
                onClick={() => onSelectResult(result)}
              >
                <Pin 
                  background={isSelected ? '#38bdf8' : '#0284c7'}
                  borderColor={isSelected ? '#e0f2fe' : '#38bdf8'}
                  glyphColor={isSelected ? '#0c4a6e' : '#e0f2fe'}
                  scale={isSelected ? 1.4 : 1.1}
                >
                  <span className="font-bold text-xs">{result.rank}</span>
                </Pin>
              </AdvancedMarker>

              {isSelected && (
                <InfoWindow
                  position={{ lat: result.lat, lng: result.lng }}
                  onCloseClick={() => onSelectResult(null)}
                  pixelOffset={[0, -40]}
                >
                  <div className="p-3 max-w-xs bg-dark-800 text-slate-200 rounded-lg shadow-xl border border-slate-700 font-sans">
                    <div className="flex justify-between items-center mb-2">
                       <h3 className="font-bold text-sm text-brand-100">{result.name}</h3>
                       <div className="bg-neon/10 text-neon px-1.5 py-0.5 rounded text-xs font-bold">
                         {result.score}
                       </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">{result.reason}</p>
                  </div>
                </InfoWindow>
              )}
            </React.Fragment>
          );
        })}
      </Map>
    </APIProvider>
  );
}
