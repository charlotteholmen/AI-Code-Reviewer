// src/components/AuthCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
          console.error('❌ No token found in callback');
          navigate('/sign-in?error=no_token');
          return;
        }

        console.log('🔑 Received token from GitHub callback');

        // Fetch user data with the token
        const response = await axios.get('http://localhost:3001/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.user) {
          const userData = response.data.user;
          
          // Save to localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          console.log('✅ GitHub login successful:', userData.username || userData.login);
          
          // Dispatch storage event for other tabs
          window.dispatchEvent(new Event('storage'));
          
          // Redirect to home page
          navigate('/');
        } else {
          throw new Error('No user data received');
        }
      } catch (error) {
        console.error('❌ Auth callback error:', error);
        navigate('/sign-in?error=callback_failed');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🤖</span>
          </div>
        </div>
        <h2 className="text-2xl text-white font-bold mb-2">Completing Authentication</h2>
        <p className="text-gray-400">Please wait while we log you in...</p>
        <p className="text-xs text-gray-600 mt-8">Redirecting to dashboard</p>
      </div>
    </div>
  );
};

export default AuthCallback;