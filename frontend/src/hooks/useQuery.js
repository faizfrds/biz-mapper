import { useState } from 'react';
import axios from 'axios';

export function useQuery() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [thoughts, setThoughts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitQuery = async (userPrompt) => {
    setQuery(userPrompt);
    setIsLoading(true);
    setThoughts([]);
    setResults([]);
    setError(null);

<<<<<<< Updated upstream
    // TODO: Phase 3 will replace this with WebSocket / SSE connection
    // For Phase 1 & 2, we just use a REST call with a fallback to mock data
    try {
      // Try to hit the real backend
      const response = await axios.post('/api/query', { prompt: userPrompt }, {
        timeout: 10000 // 10 second timeout for the real backend
      });
      
      setResults(response.data.results || []);
      setThoughts(response.data.thoughts || []);
    } catch (err) {
      console.warn('Backend unavailable, falling back to mock data.', err.message);
      
      // Fallback / mock handler for when the backend isn't ready
      const mockThoughts = [
        { id: 1, type: 'search', text: `Analyzing request: "${userPrompt}"...`, time: 0 },
        { id: 2, type: 'search', text: 'Extracting location (Seattle) and POI type (Bakery)...', time: 1000 },
        { id: 3, type: 'data', text: 'Generating BigQuery SQL for population density...', time: 2500 },
        { id: 4, type: 'data', text: 'Querying OpenStreetMap for existing bakeries...', time: 4000 },
        { id: 5, type: 'calc', text: 'Scoring areas: High residential density + low competitor density...', time: 5500 },
        { id: 6, type: 'calc', text: 'Applying transit proximity factor (w1=0.8)...', time: 7000 },
        { id: 7, type: 'search', text: 'Finalizing top 3 recommendations.', time: 8000 }
      ];

      for (const thought of mockThoughts) {
        await new Promise(resolve => setTimeout(resolve, thought.time === 0 ? 0 : 1500));
        setThoughts(prev => [...prev, { ...thought, timestamp: new Date().toLocaleTimeString() }]);
      }

      setResults([
        {
          id: 'res-1',
          rank: 1,
          lat: 47.6146,
          lng: -122.3160,
          score: 8.9,
          reason: 'Capitol Hill: Very high foot traffic proxy (3 transit lines within 2 blocks). Dense young professional demographic. Moderate competition (2 existing bakeries within 0.5 miles).',
          name: 'Candidate Site 1 (Capitol Hill)'
        },
        {
          id: 'res-2',
          rank: 2,
          lat: 47.6616,
          lng: -122.3330,
          score: 8.2,
          reason: 'Wallingford: Solid residential density. Outstanding lack of immediate sourdough competitors. Good walkability score.',
          name: 'Candidate Site 2 (Wallingford)'
        },
        {
          id: 'res-3',
          rank: 3,
          lat: 47.6200,
          lng: -122.3550,
          score: 7.7,
          reason: 'Lower Queen Anne: High residential growth rate. Very close to major tech offices (foot traffic potential), though competition is slightly higher here.',
          name: 'Candidate Site 3 (Lower Queen Anne)'
        }
      ]);
=======
    try {
      // Hit the FastAPI backend endpoint
      const response = await axios.post('/api/query', { prompt: userPrompt }, {
        timeout: 60000 // ADK agents might take up to a minute to process
      });
      
      if (response.data && response.data.results) {
        setResults(response.data.results);
      }
      if (response.data && response.data.thoughts) {
        setThoughts(response.data.thoughts);
      }
    } catch (err) {
      console.error('Backend error:', err.message);
      setError(err.message);
      setThoughts([{
        timestamp: new Date().toISOString(),
        agent: 'System',
        status: 'error',
        message: 'Could not connect to the agent backend. Please ensure the server is running.'
      }]);
>>>>>>> Stashed changes
    } finally {
      setIsLoading(false);
    }
  };

  return { query, results, thoughts, isLoading, error, submitQuery };
}
