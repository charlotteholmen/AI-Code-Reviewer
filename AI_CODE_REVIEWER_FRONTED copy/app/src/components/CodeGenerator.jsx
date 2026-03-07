// src/components/CodeGenerator.jsx
import React, { useState, useEffect } from 'react';
import { useCodeGen } from '../context/CodeGenContext';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, Send, Copy, Check, Loader2, History, X, Download, 
  Code2, Palette, Zap, Moon, Sun, Clock, Bot
} from 'lucide-react';

// ===========================================
// AI CODE GENERATOR COMPONENT
// ===========================================
const CodeGenerator = () => {
  // -----------------------------------------
  // 1. HOOKS & CONTEXT
  // -----------------------------------------
  const { 
    generateCode, currentGeneration, loading, error,
    generations, fetchHistory, clearCurrent, historyLoading
  } = useCodeGen();
  
  const { isAuthenticated, user } = useAuth();

  // -----------------------------------------
  // 2. STATE MANAGEMENT
  // -----------------------------------------
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedGeneration, setSelectedGeneration] = useState(null);

  // -----------------------------------------
  // 3. EFFECTS
  // -----------------------------------------
  useEffect(() => {
    if (isAuthenticated) fetchHistory();
  }, [isAuthenticated, fetchHistory]);

  // -----------------------------------------
  // 4. HANDLER FUNCTIONS
  // -----------------------------------------
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await generateCode(prompt);
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (code, filename = 'generated.html') => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // -----------------------------------------
  // 5. SUGGESTED PROMPTS
  // -----------------------------------------
  const suggestedPrompts = [
    "Create a futuristic dashboard with glassmorphism",
    "Build a dark mode to-do app with animations",
    "Design a premium pricing card component",
    "Make a modern login form with gradient",
    "Create an analytics dashboard with charts"
  ];

  // -----------------------------------------
  // 6. RENDER FUNCTIONS (Helper Components)
  // -----------------------------------------
  const renderLoginRequired = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center max-w-md">
        <Bot size={64} className="mx-auto mb-6 text-purple-400" />
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="text-gray-400 mb-6">Please login to use the AI Code Generator</p>
        <a href="/sign-in" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition">
          Go to Login
        </a>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-600/20 rounded-2xl">
          <Sparkles size={32} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AI Code Generator
          </h1>
          <p className="text-gray-400 mt-1">Powered by DeepSeek V4</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button onClick={() => setDarkMode(!darkMode)} 
          className={`p-2 rounded-lg transition ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
          }`}>
          <History size={18} />
          <span className="hidden md:inline">History</span>
        </button>
      </div>
    </div>
  );

  const renderUserInfo = () => (
    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
          <span className="text-lg font-semibold text-purple-400">
            {user?.username?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-medium">{user?.username}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </div>
    </div>
  );

  const renderInputArea = () => (
    <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Palette size={18} className="text-purple-400" />
        Describe Your Design
      </h3>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="E.g., Create a futuristic dashboard with glassmorphism cards, dark theme, and purple accents..."
        rows="6"
        className={`w-full p-4 rounded-lg border focus:ring-2 focus:ring-purple-500 transition ${
          darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
        }`}
      />

      <button onClick={handleGenerate} disabled={loading || !prompt.trim()}
        className={`w-full mt-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
          loading || !prompt.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
        }`}>
        {loading ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Send size={18} /> Generate Code</>}
      </button>
    </div>
  );

  const renderSuggestedPrompts = () => (
    <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
      <h3 className="text-sm font-medium text-gray-400 mb-3">Suggested Prompts</h3>
      <div className="space-y-2">
        {suggestedPrompts.map((suggestion, idx) => (
          <button key={idx} onClick={() => setPrompt(suggestion)}
            className={`w-full text-left p-3 rounded-lg text-sm transition ${
              darkMode ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}>
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );

  const renderOutput = () => {
    if (error) return (
      <div className={`mb-6 p-4 rounded-xl border ${darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-100 border-red-300'}`}>
        <p className={darkMode ? 'text-red-300' : 'text-red-700'}>{error}</p>
      </div>
    );

    if (currentGeneration) return (
      <div className={`p-6 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code2 size={18} className="text-green-400" />
            <span className="font-semibold">Generated Code</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleCopyCode(currentGeneration.code)}
              className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} title="Copy">
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
            <button onClick={() => handleDownload(currentGeneration.code)} 
              className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} title="Download">
              <Download size={16} />
            </button>
            <button onClick={clearCurrent} 
              className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} title="Clear">
              <X size={16} />
            </button>
          </div>
        </div>
        <pre className={`p-4 rounded-lg overflow-x-auto text-sm ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <code>{currentGeneration.code}</code>
        </pre>
      </div>
    );

    return (
      <div className={`p-12 rounded-xl border text-center ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <Zap size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">No Code Generated Yet</h3>
        <p className="text-gray-400">Describe what you want to build and click "Generate Code"</p>
      </div>
    );
  };

  const renderHistoryModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-2xl max-h-[80vh] rounded-2xl border overflow-hidden ${
        darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History size={18} className="text-purple-400" />
            Generation History
          </h3>
          <button onClick={() => setShowHistory(false)} className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-purple-400" />
            </div>
          ) : generations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No generation history yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generations.map((gen, idx) => (
                <div key={gen._id || idx}
                  onClick={() => { setSelectedGeneration(gen); setShowHistory(false); }}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    darkMode ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500' : 'bg-gray-50 border-gray-200 hover:border-purple-400'
                  }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Code2 size={14} className="text-purple-400" />
                      <span className="text-sm font-medium">Generation {idx + 1}</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(gen.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">{gen.prompt}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${gen.status === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                      {gen.status}
                    </span>
                    {gen.tokensUsed && <span className="text-xs text-gray-500">{gen.tokensUsed} tokens</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // -----------------------------------------
  // 7. MAIN RENDER
  // -----------------------------------------
  if (!isAuthenticated) return renderLoginRequired();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gradient-to-br from-gray-900 to-black text-white' : 'bg-gradient-to-br from-gray-100 to-white text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto p-6">
        {renderHeader()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-1 space-y-6">
            {renderUserInfo()}
            {renderInputArea()}
            {renderSuggestedPrompts()}
          </div>

          {/* Right Column - Output */}
          <div className="lg:col-span-2">
            {renderOutput()}
          </div>
        </div>

        {/* History Modal */}
        {showHistory && renderHistoryModal()}
      </div>
    </div>
  );
};

export default CodeGenerator;