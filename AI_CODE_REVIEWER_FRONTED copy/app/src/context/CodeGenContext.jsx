// src/context/CodeGenContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CodeGenContext = createContext();

export const useCodeGen = () => {
  const context = useContext(CodeGenContext);
  if (!context) {
    throw new Error('useCodeGen must be used within CodeGenProvider');
  }
  return context;
};

export const CodeGenProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [generations, setGenerations] = useState([]);
  const [currentGeneration, setCurrentGeneration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:3005/api/generate';
  const NGINX_URL = 'http://localhost/api/generate'; // Use this if going through nginx

  // Use nginx URL in production, direct in development
  const BASE_URL = process.env.NODE_ENV === 'production' ? NGINX_URL : API_BASE_URL;

  // Generate code from prompt
  const generateCode = async (prompt) => {
    if (!isAuthenticated) {
      setError('Please login first');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/code`,
        { prompt },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout for AI generation
        }
      );

      const newGeneration = response.data;
      setCurrentGeneration(newGeneration);
      
      // Add to history
      setGenerations(prev => [newGeneration, ...prev].slice(0, 20));
      
      return newGeneration;
    } catch (err) {
      console.error('❌ Generation failed:', err);
      
      let errorMessage = 'Failed to generate code';
      if (err.response) {
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Is the service running?';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch generation history
  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return;

    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/my-generations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setGenerations(response.data.generations || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated, BASE_URL]);

  // Get specific generation by ID
  const getGeneration = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/history/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return response.data.generation;
    } catch (err) {
      console.error('Failed to fetch generation:', err);
      return null;
    }
  };

  // Clear current generation
  const clearCurrent = () => {
    setCurrentGeneration(null);
    setError('');
  };

  const value = {
    // State
    generations,
    currentGeneration,
    loading,
    error,
    historyLoading,
    
    // Actions
    generateCode,
    fetchHistory,
    getGeneration,
    clearCurrent,
  };

  return (
    <CodeGenContext.Provider value={value}>
      {children}
    </CodeGenContext.Provider>
  );
};