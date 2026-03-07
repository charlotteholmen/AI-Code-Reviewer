// context/ChatContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const API_BASE_URL = 'http://localhost:3005/api/chat';

  // 🔥 LOAD CONVERSATIONS ON MOUNT AND WHEN AUTH STATE CHANGES
  useEffect(() => {
    if (isAuthenticated && !initialLoadDone) {
      console.log('🔄 Loading conversations on mount...');
      loadConversations().finally(() => setInitialLoadDone(true));
    }
  }, [isAuthenticated]);

  // Load last selected conversation from localStorage
  useEffect(() => {
    const lastConvId = localStorage.getItem('lastConversationId');
    if (lastConvId && conversations.length > 0 && !currentConversation) {
      const lastConv = conversations.find(c => c.id === lastConvId);
      if (lastConv) {
        loadConversation(lastConv.id);
      }
    }
  }, [conversations]);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const loadedConvs = response.data.conversations || [];
      setConversations(loadedConvs);
      console.log(`✅ Loaded ${loadedConvs.length} conversations`);
      
      return loadedConvs;
    } catch (err) {
      console.error('Failed to load conversations:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create new conversation
  const createConversation = async (title) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/conversations`,
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newConv = response.data.conversation;
      setConversations(prev => [newConv, ...prev]);
      
      // Auto-load the new conversation
      await loadConversation(newConv.id);
      
      return newConv;
    } catch (err) {
      console.error('Failed to create conversation:', err);
      return null;
    }
  };

  // Load specific conversation
  const loadConversation = async (conversationId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const conversation = response.data.conversation;
      setCurrentConversation(conversation);
      
      // 🔥 Save to localStorage so we can restore after reload
      localStorage.setItem('lastConversationId', conversationId);
      
      return conversation;
    } catch (err) {
      console.error('Failed to load conversation:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (conversationId, message) => {
    if (!message.trim()) return null;

    setSending(true);
    setError('');

    // Optimistic update
    const tempMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setCurrentConversation(prev => ({
      ...prev,
      messages: [...(prev?.messages || []), tempMessage]
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/messages`,
        { conversationId, message },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      // Update with actual AI response
      setCurrentConversation(prev => ({
        ...prev,
        ...response.data.conversation,
        messages: [...prev.messages, response.data.message]
      }));

      // Update conversations list with new lastActivity
      setConversations(prev => 
        prev.map(c => 
          c.id === conversationId 
            ? { 
                ...c, 
                lastActivity: new Date().toISOString(), 
                messageCount: (c.messageCount || 0) + 2 
              }
            : c
        ).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      );

      return response.data;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.error || 'Failed to send message');
      
      // Revert optimistic update
      setCurrentConversation(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m !== tempMessage)
      }));
      
      return null;
    } finally {
      setSending(false);
    }
  };

  // Delete conversation
  const deleteConversation = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // If the deleted conversation was the current one, clear it
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        localStorage.removeItem('lastConversationId');
      }
      
      return true;
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      return false;
    }
  };

  // Clear current conversation (without deleting)
  const clearCurrentConversation = () => {
    setCurrentConversation(null);
    localStorage.removeItem('lastConversationId');
  };

  const value = {
    conversations,
    currentConversation,
    loading,
    sending,
    error,
    loadConversations,
    createConversation,
    loadConversation,
    sendMessage,
    deleteConversation,
    clearCurrentConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};