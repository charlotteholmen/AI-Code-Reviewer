// components/ChatInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { 
  Send, Plus, MessageSquare, Trash2, Loader2, 
  Menu, X, ChevronLeft, MoreVertical, Edit2,
  Cpu, Sparkles, Zap, Award, Star, Bot,
  Copy, Check, Code, FileCode, Terminal
} from 'lucide-react';

// Code Block Component with Copy Button
const CodeBlock = ({ code, language = 'javascript' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Detect if content is code (contains code block markers or indentation)
  const isCodeBlock = code.includes('```') || 
                     code.includes('function') || 
                     code.includes('const ') ||
                     code.includes('let ') ||
                     code.includes('import ') ||
                     code.includes('class ') ||
                     code.includes('<div') ||
                     code.includes('{') && code.includes('}');

  if (!isCodeBlock) {
    return <div className="whitespace-pre-wrap text-sm leading-relaxed">{code}</div>;
  }

  // Extract language if specified in markdown code block
  const codeMatch = code.match(/```(\w*)\n([\s\S]*?)```/);
  if (codeMatch) {
    const [, lang, codeContent] = codeMatch;
    return (
      <div className="my-3 group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileCode size={14} className="text-green-400" />
            <span className="text-xs font-mono text-gray-400">
              {lang || language}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs flex items-center gap-2"
          >
            {copied ? (
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
        <pre className="bg-gray-950 rounded-xl p-4 overflow-x-auto border border-purple-500/20">
          <code className={`language-${lang || language} text-sm font-mono text-green-300`}>
            {codeContent.trim()}
          </code>
        </pre>
      </div>
    );
  }

  // If it's inline code or code-like text
  return (
    <div className="my-2 group relative">
      <pre className="bg-gray-950 rounded-lg p-3 overflow-x-auto text-sm border border-purple-500/20">
        <code className="text-green-300 font-mono">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs flex items-center gap-1"
      >
        {copied ? (
          <>
            <Check size={12} className="text-green-400" />
            Copied
          </>
        ) : (
          <>
            <Copy size={12} />
            Copy
          </>
        )}
      </button>
    </div>
  );
};

// Message Component
const Message = ({ msg, isUser }) => {
  // Parse message content to separate code blocks from text
  const parseContent = (content) => {
    const parts = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'javascript',
        content: match[2].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }

    return parts;
  };

  const parts = parseContent(msg.content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%] rounded-2xl p-4 shadow-lg
          ${isUser
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
            : 'bg-gray-800/80 backdrop-blur-sm text-gray-200 border border-purple-500/30'
          }
        `}
      >
        <div className="flex items-center gap-2 mb-3">
          {!isUser && (
            <>
              <div className="p-1 bg-purple-600/20 rounded-lg">
                <Bot size={16} className="text-purple-400" />
              </div>
              <span className="text-xs font-semibold text-purple-300">Cerebras AI</span>
            </>
          )}
          {isUser && (
            <span className="text-xs opacity-70">You</span>
          )}
        </div>
        
        <div className="space-y-3">
          {parts.map((part, idx) => (
            part.type === 'code' ? (
              <CodeBlock 
                key={idx} 
                code={part.content} 
                language={part.language}
              />
            ) : (
              <div key={idx} className="whitespace-pre-wrap text-sm leading-relaxed">
                {part.content}
              </div>
            )
          ))}
        </div>
        
        <div className="text-xs mt-3 opacity-50">
          {new Date(msg.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

const ChatInterface = () => {
  const {
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
  } = useChat();

  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, sending]);

  // Focus input when conversation loads
  useEffect(() => {
    if (currentConversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewChat = async () => {
    const newConv = await createConversation();
    if (newConv) {
      setSidebarOpen(false);
      setShowInfo(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !currentConversation || sending) return;
    
    const sentMessage = message;
    setMessage('');
    await sendMessage(currentConversation.id, sentMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      await deleteConversation(id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar - Conversations */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-80 bg-gray-900/95 backdrop-blur-xl border-r border-purple-500/20
        transform transition-transform duration-300 ease-in-out
        flex flex-col shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Cerebras AI
              </h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          
          <button
            onClick={handleNewChat}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 px-4 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            New Conversation
          </button>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && conversations.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-purple-400" size={24} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start a new chat</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => {
                  loadConversation(conv.id);
                  setSidebarOpen(false);
                  setShowInfo(false);
                }}
                className={`
                  group relative p-3 rounded-lg cursor-pointer transition-all
                  ${currentConversation?.id === conv.id
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'hover:bg-gray-800/50 border border-transparent'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate pr-8 flex items-center gap-1">
                      <MessageSquare size={14} className="text-purple-400 flex-shrink-0" />
                      {conv.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(conv.lastActivity)}
                    </p>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Message Count Badge */}
                {conv.messageCount > 0 && (
                  <div className="absolute bottom-2 right-2 text-xs px-1.5 py-0.5 bg-purple-900/50 rounded-full text-purple-300 border border-purple-500/30">
                    {conv.messageCount} msgs
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* AI Info Footer */}
        <div className="p-4 border-t border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-blue-900/10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Bot size={14} className="text-purple-400" />
            <span>Powered by <span className="text-purple-400 font-semibold">Cerebras</span> Llama 3.1 8B</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Chat Header */}
        {currentConversation ? (
          <div className="h-16 border-b border-purple-500/20 flex items-center justify-between px-4 bg-gray-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
              >
                <Menu size={20} />
              </button>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{currentConversation.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-purple-600/20 rounded-full text-purple-300 border border-purple-500/30">
                    Cerebras AI
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {currentConversation.messages?.length || 0} messages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-purple-400 transition"
                title="AI Information"
              >
                <Sparkles size={18} />
              </button>
              <button
                onClick={clearCurrentConversation}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
                title="Close conversation"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-16 border-b border-purple-500/20 flex items-center px-4 bg-gray-900/80 backdrop-blur-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <span className="ml-2 text-gray-400">Select a conversation</span>
          </div>
        )}

        {/* Split View: Messages + Info Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages Area */}
          <div className={`flex-1 flex flex-col ${showInfo ? 'w-2/3' : 'w-full'}`}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!currentConversation ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Bot size={64} className="mx-auto mb-4 text-purple-400/30" />
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Cerebras AI Engineer
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">30-Year Veteran Software Engineer</p>
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-purple-600/20 rounded-full text-purple-300">Llama 3.1 8B</span>
                      <span className="px-2 py-1 bg-blue-600/20 rounded-full text-blue-300">Cerebras</span>
                    </div>
                  </div>
                </div>
              ) : currentConversation.messages?.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                    <h3 className="text-xl font-semibold mb-2">New Conversation</h3>
                    <p className="text-sm">Send your first message to start</p>
                  </div>
                </div>
              ) : (
                currentConversation.messages.map((msg, idx) => (
                  <Message 
                    key={idx} 
                    msg={msg} 
                    isUser={msg.role === 'user'} 
                  />
                ))
              )}
              
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin text-purple-400" size={16} />
                      <span className="text-sm text-gray-300">Cerebras AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {currentConversation && (
              <div className="p-4 border-t border-purple-500/20 bg-gray-900/80 backdrop-blur-sm">
                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask your 30-year veteran engineer..."
                    className="flex-1 bg-gray-800 border border-purple-500/30 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="2"
                    disabled={sending}
                  />
                  
                  <button
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    className={`
                      px-6 rounded-xl font-semibold transition-all
                      flex items-center justify-center gap-2
                      ${sending || !message.trim()
                        ? 'bg-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-lg shadow-purple-500/20'
                      }
                    `}
                  >
                    {sending ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Send size={18} />
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  <div className="flex items-center gap-2">
                    <Cpu size={12} className="text-purple-400" />
                    <span className="text-xs text-gray-500">Cerebras Llama 3.1 8B</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Info Panel */}
          {showInfo && (
            <div className="w-1/3 border-l border-purple-500/20 bg-gray-900/90 backdrop-blur-sm p-4 overflow-y-auto animate-slideIn">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Cpu size={18} className="text-purple-400" />
                  AI Information
                </h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              {/* AI Model Card */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/30 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Bot size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold">Cerebras AI</h4>
                    <p className="text-xs text-gray-400">30-Year Veteran Engineer</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Model:</span>
                    <span className="text-purple-300 font-medium">Llama 3.1 8B</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Provider:</span>
                    <span className="text-blue-300 font-medium">Cerebras</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Context:</span>
                    <span className="text-green-300 font-medium">8K tokens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Experience:</span>
                    <span className="text-yellow-300 font-medium">30+ years</span>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" />
                  Capabilities
                </h4>
                <div className="space-y-2">
                  {[
                    'System Architecture',
                    'Full-Stack Development',
                    'Code Review & Debugging',
                    'DevOps & Cloud',
                    'Security Engineering',
                    'Performance Optimization',
                    'Career Mentorship'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <Award size={20} className="mx-auto mb-1 text-yellow-400" />
                  <div className="text-lg font-bold text-purple-300">100M+</div>
                  <div className="text-xs text-gray-400">Users Scaled</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <Star size={20} className="mx-auto mb-1 text-yellow-400" />
                  <div className="text-lg font-bold text-blue-300">20+</div>
                  <div className="text-xs text-gray-400">Languages</div>
                </div>
              </div>

              {/* Conversation Stats */}
              {currentConversation && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold mb-2">Current Chat</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Messages:</span>
                      <span>{currentConversation.messages?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Code blocks:</span>
                      <span>
                        {currentConversation.messages?.filter(m => 
                          m.content.includes('```')
                        ).length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;