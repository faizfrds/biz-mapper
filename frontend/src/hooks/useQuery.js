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
    } finally {
      setIsLoading(false);
    }
  };

  return { query, results, thoughts, isLoading, error, submitQuery };
}
