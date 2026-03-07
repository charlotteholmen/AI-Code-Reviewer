// src/components/GitHubMCPButton.jsx
import React, { useState, useEffect } from 'react';
import { 
  Github, 
  GitBranch, 
  Check, 
  Loader2, 
  AlertCircle, 
  ExternalLink, 
  Code,
  Key,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
// ../context/AuthContext
import githubMCP from '../../services/githubMCP';
// ../services/githubMCP

const GitHubMCPButton = ({ code, language }) => {
  const { user, isGitHubUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [testingToken, setTestingToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Initialize MCP service and test token
  useEffect(() => {
    if (isGitHubUser && user) {
      const jwtToken = localStorage.getItem('token');
      
      // Initialize MCP with user data
      githubMCP.init(user, jwtToken);
      
      // Test the GitHub token
      const testToken = async () => {
        setTestingToken(true);
        try {
          const result = await githubMCP.testGitHubToken();
          setTokenStatus(result);
          
          if (result.valid) {
            console.log('✅ GitHub token is valid for:', result.user);
            setError('');
          } else {
            console.error('❌ GitHub token invalid:', result.error);
            setError('GitHub token expired. Please re-login.');
          }
        } catch (err) {
          console.error('❌ Error testing token:', err);
          setTokenStatus({ valid: false, error: err.message });
        } finally {
          setTestingToken(false);
        }
      };
      
      testToken();
      
      // Fetch user's recent repos
      const fetchRepos = async () => {
        setLoadingRepos(true);
        try {
          const userRepos = await githubMCP.getUserRepos(5);
          setRepos(userRepos);
        } catch (err) {
          console.error('Failed to fetch repos:', err);
        } finally {
          setLoadingRepos(false);
        }
      };
      
      fetchRepos();
    }
  }, [user, isGitHubUser]);

  const handlePush = async () => {
    if (!code?.trim()) {
      setError('No code to push');
      return;
    }

    if (!tokenStatus?.valid) {
      setError('GitHub token is not valid. Please re-login.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setResult(null);

    try {
      const fileName = `code-review-${Date.now()}`;
      const result = await githubMCP.pushToGitHub(code, language, fileName);
      
      setSuccess(true);
      setResult(result);
      console.log('✅ MCP Push successful:', result);
      
      // Refresh repos list
      const userRepos = await githubMCP.getUserRepos(5);
      setRepos(userRepos);
      
      // Auto hide success message after 15 seconds
      setTimeout(() => {
        setSuccess(false);
        setResult(null);
      }, 15000);
      
    } catch (err) {
      console.error('❌ MCP Push failed:', err);
      setError(err.message || 'Failed to push to GitHub');
      
      // If token is invalid, trigger re-login
      if (err.message.includes('authentication') || err.message.includes('401')) {
        setTimeout(() => {
          logout();
        }, 3000);
      }
      
      // Auto hide error after 10 seconds
      setTimeout(() => setError(''), 10000);
      
    } finally {
      setLoading(false);
    }
  };

  const handleReLogin = () => {
    logout();
    window.location.href = '/sign-in';
  };

  // If not GitHub user, show disabled button
  if (!isGitHubUser) {
    return (
      <div className="relative group">
        <button
          disabled
          className="relative flex items-center gap-1 bg-gray-700 text-gray-400 px-3 py-2 rounded text-sm cursor-not-allowed opacity-70"
        >
          <Github size={16} />
          <span className='hidden md:inline'>GitHub</span>
          <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 shadow-lg'>
            Login with GitHub to push code
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Button Group */}
      <div className="flex items-center gap-1">
        {/* Push Button */}
        <button
          onClick={handlePush}
          disabled={loading || !code?.trim() || testingToken || !tokenStatus?.valid}
          className={`relative flex items-center gap-1 px-3 py-2 rounded-l text-sm transition-all ${
            loading || testingToken
              ? 'bg-blue-600/50 cursor-wait' 
              : success 
                ? 'bg-green-600 hover:bg-green-700' 
                : !tokenStatus?.valid
                  ? 'bg-red-900/50 cursor-not-allowed'
                  : !code?.trim()
                    ? 'bg-gray-700 cursor-not-allowed opacity-70'
                    : 'bg-gray-700 hover:bg-gray-600'
          } text-white`}
          title={!code?.trim() ? 'Write some code first' : 'Push to GitHub with MCP'}
        >
          {loading || testingToken ? (
            <Loader2 size={16} className="animate-spin" />
          ) : success ? (
            <Check size={16} className="text-white" />
          ) : (
            <Github size={16} />
          )}
          <span className='hidden md:inline'>
            {loading ? 'Pushing...' : 
             testingToken ? 'Verifying...' : 
             success ? 'Pushed!' : 
             !tokenStatus?.valid ? 'Re-login Needed' : 
             'Push to GitHub'}
          </span>
        </button>

        {/* Dropdown Toggle Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-2 py-2 bg-gray-800 hover:bg-gray-700 rounded-r text-gray-300 border-l border-gray-600"
        >
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Token Status Indicator */}
      {tokenStatus?.valid && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      )}
      {tokenStatus?.valid === false && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      )}

      {/* Details Dropdown */}
      {showDetails && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-4 z-50 animate-fadeIn">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Github size={18} className="text-gray-400" />
              <span className="text-sm font-semibold text-white">GitHub MCP</span>
            </div>
            <button 
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg mb-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src={user?.avatar_url} 
                alt={user?.login}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${user?.login}&background=random`;
                }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.login}</p>
              <p className="text-xs text-gray-400">{user?.username}</p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs ${
              tokenStatus?.valid ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
            }`}>
              {tokenStatus?.valid ? 'Token Valid' : 'Token Invalid'}
            </div>
          </div>

          {/* Token Status */}
          <div className="mb-3 p-3 bg-gray-900/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">GitHub Token</span>
              <button
                onClick={handleReLogin}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <RefreshCw size={12} />
                Re-login
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Key size={14} className="text-gray-500" />
              <code className="text-xs bg-gray-950 px-2 py-1 rounded text-gray-300">
                {user?.oauth_token ? `${user.oauth_token.substring(0, 15)}...` : 'No token'}
              </code>
            </div>
            {tokenStatus?.error && (
              <p className="text-xs text-red-400 mt-2">
                ⚠️ {tokenStatus.error}
              </p>
            )}
          </div>

          {/* Recent Repositories */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Recent Repositories</span>
              {loadingRepos && <Loader2 size={12} className="animate-spin text-gray-400" />}
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
              {repos.length > 0 ? (
                repos.map((repo, idx) => (
                  <a
                    key={idx}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 bg-gray-900/30 hover:bg-gray-700/50 rounded-lg transition"
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch size={12} className="text-gray-500" />
                      <span className="text-xs text-gray-300">{repo.name}</span>
                    </div>
                    <ExternalLink size={12} className="text-gray-500" />
                  </a>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">
                  No repositories yet
                </p>
              )}
            </div>
          </div>

          {/* Push Info */}
          {code?.trim() && (
            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Info size={14} className="text-blue-400" />
                <span className="text-xs font-medium text-blue-400">Ready to push</span>
              </div>
              <p className="text-xs text-gray-400">
                {code.length} characters • {language} • Will create new repository
              </p>
            </div>
          )}
        </div>
      )}

      {/* Success Popup */}
      {success && result && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-green-500/30 p-4 z-50 animate-slideIn">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500/20 rounded-full">
              <Check size={16} className="text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-400 mb-1">
                Push Successful! 🎉
              </h4>
              <p className="text-xs text-gray-300 mb-2">
                Code pushed to {result.repoName}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <a
                  href={result.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs flex items-center justify-center gap-1 transition"
                >
                  <ExternalLink size={12} />
                  View Repo
                </a>
                {result.fileUrl && (
                  <a
                    href={result.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center justify-center gap-1 transition"
                  >
                    <Code size={12} />
                    View Code
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⚡ Pushed at {new Date(result.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button 
              onClick={() => { setSuccess(false); setResult(null); }}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {error && (
        <div className="absolute right-0 mt-2 w-80 bg-red-900/90 rounded-lg shadow-xl border border-red-500/30 p-4 z-50 animate-slideIn">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-500/20 rounded-full">
              <AlertCircle size={16} className="text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-400 mb-1">
                Push Failed
              </h4>
              <p className="text-xs text-gray-300">
                {error}
              </p>
              {error.includes('authentication') || error.includes('401') ? (
                <button
                  onClick={handleReLogin}
                  className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs text-white flex items-center gap-2 transition"
                >
                  <RefreshCw size={12} />
                  Re-login with GitHub
                </button>
              ) : (
                <button
                  onClick={handlePush}
                  className="mt-3 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white flex items-center gap-2 transition"
                >
                  <RefreshCw size={12} />
                  Try Again
                </button>
              )}
            </div>
            <button 
              onClick={() => setError('')}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
  );
};

export default GitHubMCPButton;