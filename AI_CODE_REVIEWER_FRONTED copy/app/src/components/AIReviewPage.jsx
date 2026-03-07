import React, { useState, useEffect } from 'react'
import { useAIReview } from '../context/AIReviewContext'
import { useCodeEditor } from '../context/CodeEditorContext'
import { useNavigate } from 'react-router-dom'
import { 
  Copy, 
  Check, 
  Code, 
  AlertCircle, 
  FileCode,
  Zap,
  Bug,
  BookOpen,
  X,
  Calendar,
  User,
  Bot,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const AIReviewPage = () => {
  const { 
    output,
    getAIReview,
    isLoading,
    connectionError,
    getAIChatHistory,
    clearOutput,
    testAIServiceDirectly,
    checkAIResultManually,
    testAllServices,
    connectionStatus,
    getConnectionDetails,
    chatHistory,
    setChatHistory
  } = useAIReview()
  
  // Get code and language from editor context
  let code = '';
  let setCode = () => {};
  let language = 'javascript';
  let setLanguage = () => {};
  
  try {
    const editorContext = useCodeEditor();
    code = editorContext?.code || '';
    setCode = editorContext?.setCode || (() => {});
    language = editorContext?.language || 'javascript';
    setLanguage = editorContext?.setLanguage || (() => {});
  } catch (error) {
    console.log('⚠️ CodeEditorContext not available, using local state');
    [code, setCode] = useState('');
    [language, setLanguage] = useState('javascript');
  }
  
  const [showHistory, setShowHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [currentHistoryPage, setCurrentHistoryPage] = useState(0)
  const navigate = useNavigate()

  // Load AI chat history
  useEffect(() => {
    let isMounted = true;
    
    const loadHistory = async () => {
      if (loadingHistory) return;
      
      setLoadingHistory(true);
      try {
        const history = await getAIChatHistory();
        if (isMounted) {
          setChatHistory(history || []);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };
    
    loadHistory();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Parse AI response into sections and code blocks
  const parseAIResponse = (text) => {
    if (!text) return { sections: [], codeBlocks: [] };
    
    const sections = [];
    const codeBlocks = [];
    
    // Extract code blocks with language
    const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    let lastIndex = 0;
    let textWithoutCode = text;
    
    while ((match = codeRegex.exec(text)) !== null) {
      const [fullMatch, lang, code] = match;
      const index = match.index;
      
      // Add text before code block as section
      if (index > lastIndex) {
        const sectionText = text.substring(lastIndex, index);
        sections.push({ type: 'text', content: sectionText });
      }
      
      // Add code block
      codeBlocks.push({
        language: lang || 'javascript',
        code: code.trim(),
        index: codeBlocks.length
      });
      
      sections.push({ 
        type: 'code', 
        language: lang || 'javascript',
        content: code.trim(),
        index: codeBlocks.length - 1
      });
      
      lastIndex = index + fullMatch.length;
      textWithoutCode = textWithoutCode.replace(fullMatch, '');
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      sections.push({ type: 'text', content: text.substring(lastIndex) });
    }
    
    return { sections, codeBlocks };
  };

  const handleCopyCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAllCode = async () => {
    const { codeBlocks } = parseAIResponse(output);
    const allCode = codeBlocks.map(cb => cb.code).join('\n\n');
    await handleCopyCode(allCode, 'all');
  };

  const handleGetReview = async () => {
    if (!code || !code.trim()) {
      alert('Please enter some code to review')
      return
    }
    
    try {
      await getAIReview(code, language)
    } catch (error) {
      console.error('AI Review error:', error)
      alert('Failed to get AI review: ' + error.message)
    }
  }

  const loadFromHistory = (content) => {
    if (!content) return;
    const lines = content.split('\n')
    const codeStart = lines.findIndex(line => line.includes('```'))
    if (codeStart !== -1) {
      const codeEnd = lines.findIndex((line, idx) => idx > codeStart && line.includes('```'))
      if (codeEnd !== -1) {
        const extractedCode = lines.slice(codeStart + 1, codeEnd).join('\n')
        setCode(extractedCode)
      }
    }
  }

  const openHistoryItem = (item, index) => {
    setSelectedHistoryItem(item);
    setCurrentHistoryPage(index);
    setShowHistoryModal(true);
  }

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedHistoryItem(null);
  }

  const navigateHistory = (direction) => {
    const aiMessages = chatHistory.filter(msg => msg.sender?.toLowerCase() === 'ai');
    const newIndex = currentHistoryPage + direction;
    if (newIndex >= 0 && newIndex < aiMessages.length) {
      setCurrentHistoryPage(newIndex);
      setSelectedHistoryItem(aiMessages[newIndex]);
    }
  }

  const getStatusColor = () => {
    switch(connectionStatus) {
      case 'processing':
      case 'waiting_for_response':
        return 'text-yellow-400'
      case 'completed':
        return 'text-green-400'
      case 'error':
      case 'timeout':
        return 'text-red-400'
      case 'all_services_ok':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusText = () => {
    switch(connectionStatus) {
      case 'ready': return 'Ready'
      case 'processing': return 'Processing...'
      case 'waiting_for_response': return 'Waiting for AI...'
      case 'completed': return 'Completed'
      case 'error': return 'Error'
      case 'timeout': return 'Timeout'
      case 'testing': return 'Testing...'
      case 'all_services_ok': return 'All Services OK'
      case 'no_history': return 'No History'
      default: return connectionStatus
    }
  }

  const connectionDetails = getConnectionDetails()
  const { sections, codeBlocks } = parseAIResponse(output);
  const aiMessages = chatHistory.filter(msg => msg.sender?.toLowerCase() === 'ai');

  // Format text with markdown-like styling
  const formatText = (text) => {
    if (!text) return null;
    
    const parts = text.split(/(#{1,3}\s.*?\n)/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('###')) {
        return <h3 key={idx} className="text-lg font-semibold text-blue-300 mt-6 mb-3">{part.replace('###', '').trim()}</h3>;
      }
      if (part.startsWith('##')) {
        return <h2 key={idx} className="text-xl font-bold text-purple-300 mt-8 mb-4 border-b border-gray-700 pb-2">{part.replace('##', '').trim()}</h2>;
      }
      if (part.startsWith('#')) {
        return <h1 key={idx} className="text-2xl font-bold text-green-300 mt-8 mb-4">{part.replace('#', '').trim()}</h1>;
      }
      
      return part.split('\n\n').map((para, pIdx) => {
        if (para.trim()) {
          if (para.trim().startsWith('*') || para.trim().startsWith('-')) {
            return (
              <ul key={`${idx}-${pIdx}`} className="list-disc list-inside space-y-1 my-3 text-gray-300">
                {para.split('\n').map((item, iIdx) => {
                  if (item.trim().startsWith('*') || item.trim().startsWith('-')) {
                    return <li key={iIdx} className="ml-2">{item.replace(/^[\*\-]\s/, '')}</li>;
                  }
                  return null;
                })}
              </ul>
            );
          }
          
          if (para.trim().match(/^\d+\./)) {
            return (
              <ol key={`${idx}-${pIdx}`} className="list-decimal list-inside space-y-1 my-3 text-gray-300">
                {para.split('\n').map((item, iIdx) => {
                  if (item.trim().match(/^\d+\./)) {
                    return <li key={iIdx} className="ml-2">{item.replace(/^\d+\.\s/, '')}</li>;
                  }
                  return null;
                })}
              </ol>
            );
          }
          
          return <p key={`${idx}-${pIdx}`} className="text-gray-300 leading-relaxed mb-4">{para}</p>;
        }
        return null;
      });
    });
  };

  // Render full history item content
  const renderHistoryContent = (item) => {
    if (!item) return null;
    
    const { sections, codeBlocks } = parseAIResponse(item.content);
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-300">Hybrid AI Analysis</h3>
              <p className="text-sm text-gray-400">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {sections.map((section, idx) => {
          if (section.type === 'text') {
            return (
              <div key={idx} className="text-gray-200">
                {formatText(section.content)}
              </div>
            );
          } else {
            return (
              <div key={idx} className="my-6 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileCode size={16} className="text-green-400" />
                    <span className="text-xs font-mono text-gray-400">
                      {section.language}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(section.content, `history-${idx}`)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs flex items-center gap-2"
                  >
                    {copiedIndex === `history-${idx}` ? (
                      <>
                        <Check size={14} className="text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <pre className="bg-gray-950 rounded-xl p-4 overflow-x-auto">
                    <code className={`language-${section.language} text-sm font-mono text-green-300`}>
                      {section.content}
                    </code>
                  </pre>
                </div>
              </div>
            );
          }
        })}

        {/* Footer */}
        {item.content.includes('---') && (
          <div className="mt-8 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              {item.content.split('---')[1]?.trim() || 'Powered by Hybrid AI System (Cerebras + Groq)'}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              🤖 AI Code Review
            </h1>
            <p className="text-gray-400 mt-2">Get AI-powered feedback on your code quality and best practices</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => navigate('/editor')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
            >
              <span>←</span>
              Back to Editor
            </button>
            
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition flex items-center gap-2"
            >
              <span>📜</span>
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>
        </div>
        
        {/* Status Panel */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="font-medium">AI Service</span>
              </div>
              <span className="text-sm">Port 3003</span>
            </div>
            <div className="text-sm text-gray-400">
              Cerebras + Groq AI
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Editor Service</span>
              </div>
              <span className="text-sm">Port 3002</span>
            </div>
            <div className="text-sm text-gray-400">
              Code Execution
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor().includes('green') ? 'bg-green-500' : getStatusColor().includes('red') ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <span className="font-medium">Status</span>
              </div>
              <span className={`text-sm ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              HTTP Mode
            </div>
          </div>
        </div>

        {connectionError && (
          <div className="mb-4 p-3 bg-yellow-900/30 rounded-lg border border-yellow-800 flex items-center gap-2">
            <AlertCircle size={16} className="text-yellow-500" />
            <span>{connectionError}</span>
          </div>
        )}

        {/* Test Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button 
            onClick={testAllServices}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm flex items-center gap-2"
          >
            <Zap size={14} />
            Test All Services
          </button>
          <button 
            onClick={testAIServiceDirectly}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm flex items-center gap-2"
          >
            <FileCode size={14} />
            Test AI Service
          </button>
          <button 
            onClick={checkAIResultManually}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm flex items-center gap-2"
          >
            <Bug size={14} />
            Check Latest AI Result
          </button>
          <button 
            onClick={clearOutput}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm flex items-center gap-2"
          >
            <span>🗑️</span>
            Clear Output
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Code Input */}
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-green-300 flex items-center gap-2">
              <Code size={20} />
              Your Code
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-gray-300">Programming Language</label>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">Code to Review</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Paste your ${language} code here...`}
                rows={15}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl p-4 font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button 
                onClick={handleGetReview}
                disabled={isLoading || !code?.trim()}
                className={`flex-1 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                  isLoading || !code?.trim() 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    AI is Analyzing...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🤖</span>
                    Get AI Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-blue-300 flex items-center gap-3">
                <BookOpen size={20} />
                AI Analysis Results
                {isLoading && (
                  <span className="text-xs px-2 py-1 bg-blue-900/50 rounded-full animate-pulse">
                    Processing...
                  </span>
                )}
              </h2>
              {output && codeBlocks.length > 0 && (
                <button 
                  onClick={handleCopyAllCode}
                  className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
                >
                  {copiedIndex === 'all' ? (
                    <>
                      <Check size={16} className="text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy All Code
                    </>
                  )}
                </button>
              )}
            </div>
            
            {output ? (
              <div className="bg-gray-900/80 rounded-xl p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="prose prose-invert max-w-none">
                  {/* AI Response Header */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-300">Hybrid AI Analysis</h3>
                        <p className="text-sm text-gray-400">Powered by Cerebras + Groq</p>
                      </div>
                    </div>
                  </div>

                  {/* Render sections */}
                  {sections.map((section, idx) => {
                    if (section.type === 'text') {
                      return (
                        <div key={idx} className="text-gray-200">
                          {formatText(section.content)}
                        </div>
                      );
                    } else {
                      return (
                        <div key={idx} className="my-6 group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FileCode size={16} className="text-green-400" />
                              <span className="text-xs font-mono text-gray-400">
                                {section.language}
                              </span>
                            </div>
                            <button
                              onClick={() => handleCopyCode(section.content, section.index)}
                              className="opacity-0 group-hover:opacity-100 transition px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs flex items-center gap-2"
                            >
                              {copiedIndex === section.index ? (
                                <>
                                  <Check size={14} className="text-green-400" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  Copy Code
                                </>
                              )}
                            </button>
                          </div>
                          <div className="relative">
                            <pre className="bg-gray-950 rounded-xl p-4 overflow-x-auto">
                              <code className={`language-${section.language} text-sm font-mono text-green-300`}>
                                {section.content}
                              </code>
                            </pre>
                          </div>
                        </div>
                      );
                    }
                  })}

                  {/* Footer */}
                  {output.includes('---') && (
                    <div className="mt-8 pt-4 border-t border-gray-800 text-center">
                      <p className="text-xs text-gray-500">
                        {output.split('---')[1]?.trim() || 'Powered by Hybrid AI System (Cerebras + Groq)'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <div className="text-6xl mb-6 opacity-50">🤖</div>
                <p className="text-xl mb-3">No AI review yet</p>
                <p className="text-gray-400">Submit your code to get AI-powered feedback</p>
                <div className="mt-6 flex items-center justify-center gap-4 text-xs">
                  <span className="px-3 py-1 bg-gray-800 rounded-full">Code Quality</span>
                  <span className="px-3 py-1 bg-gray-800 rounded-full">Bug Detection</span>
                  <span className="px-3 py-1 bg-gray-800 rounded-full">Best Practices</span>
                </div>
              </div>
            )}
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                  📜 Review History
                  <span className="text-sm font-normal bg-gray-900 px-2 py-1 rounded-full">
                    {aiMessages.length} reviews
                  </span>
                </h2>
                <button 
                  onClick={async () => {
                    const history = await getAIChatHistory();
                    setChatHistory(history || []);
                  }}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-2"
                >
                  <span>🔄</span>
                  Refresh
                </button>
              </div>
              
              {aiMessages.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {aiMessages.map((msg, idx) => {
                    const { codeBlocks } = parseAIResponse(msg.content);
                    const date = new Date(msg.timestamp);
                    
                    return (
                      <div 
                        key={idx} 
                        className="p-5 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-xl hover:from-gray-800 hover:to-gray-700 cursor-pointer transition-all border border-gray-700 hover:border-purple-500 group"
                        onClick={() => openHistoryItem(msg, idx)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition">
                              <Bot size={18} className="text-purple-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-purple-300">
                                  AI Code Review
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300 flex items-center gap-1">
                                  <FileCode size={12} />
                                  {codeBlocks.length} block{codeBlocks.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar size={12} className="text-gray-500" />
                                <span className="text-xs text-gray-400">
                                  {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            className="opacity-0 group-hover:opacity-100 transition px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              openHistoryItem(msg, idx);
                            }}
                          >
                            Read Full Review
                            <ChevronRight size={14} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-3 pl-2 border-l-2 border-purple-500/50">
                          {msg.content?.substring(0, 200) || ''}
                          {msg.content?.length > 200 ? '...' : ''}
                        </p>
                        {codeBlocks.length > 0 && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                            <Code size={12} />
                            <span>Contains code examples in {codeBlocks.map(cb => cb.language).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-4 opacity-30">📜</div>
                  <p className="text-lg mb-2">No review history yet</p>
                  <p className="text-sm text-gray-400">Submit your first code review to see it here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Bot size={24} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Code Review</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {new Date(selectedHistoryItem.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Navigation buttons */}
                <button
                  onClick={() => navigateHistory(-1)}
                  disabled={currentHistoryPage === 0}
                  className={`p-2 rounded-lg transition ${
                    currentHistoryPage === 0 
                      ? 'text-gray-600 cursor-not-allowed' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-400">
                  {currentHistoryPage + 1} / {aiMessages.length}
                </span>
                <button
                  onClick={() => navigateHistory(1)}
                  disabled={currentHistoryPage === aiMessages.length - 1}
                  className={`p-2 rounded-lg transition ${
                    currentHistoryPage === aiMessages.length - 1
                      ? 'text-gray-600 cursor-not-allowed' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={closeHistoryModal}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                >
                  <X size={20} className="text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
              {renderHistoryContent(selectedHistoryItem)}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-4 text-gray-400">
            <span>User ID: {connectionDetails?.userId?.substring(0, 10) || 'N/A'}...</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span>Status: <span className={getStatusColor()}>{getStatusText()}</span></span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span>Mode: HTTP</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Cerebras
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300 flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              Groq
            </span>
            <span className="text-xs text-gray-500">Hybrid AI System</span>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8);
        }
      `}</style>
    </div>
  )
}

export default AIReviewPage