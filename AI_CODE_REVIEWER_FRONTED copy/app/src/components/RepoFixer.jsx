// src/components/RepoFixer.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Github,
  Search,
  Wand2,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  FileCode,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  GitBranch,
  Link2,
  FolderGit2
} from 'lucide-react'
import axios from 'axios'

const API_PORT = 3004
const API_BASE_URL = `http://localhost:${API_PORT}`

const RepoFixer = () => {
  const { user, githubToken, isAuthenticated } = useAuth()
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [analysisId, setAnalysisId] = useState('')
  const [fixing, setFixing] = useState(false)
  const [prUrl, setPrUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('import')
  const [debugInfo, setDebugInfo] = useState('')
  const [expandedFiles, setExpandedFiles] = useState({})
  const [analyses, setAnalyses] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // New states for repo selector
  const [inputMethod, setInputMethod] = useState('url')
  const [userRepos, setUserRepos] = useState([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState('')

  // Debug: Log what we have
  useEffect(() => {
    console.log('👤 User:', user)
    console.log('🔑 GitHub Token:', githubToken)
    console.log('🔐 Token exists:', !!githubToken)
    console.log('📝 Token preview:', githubToken?.substring(0, 15) + '...')
    console.log('🔧 API URL:', API_BASE_URL)
  }, [user, githubToken])

  // Load user's analysis history
  useEffect(() => {
    if (isAuthenticated && activeTab === 'history') {
      fetchAnalyses()
    }
  }, [isAuthenticated, activeTab])

  // Fetch repos when switching to select mode
  useEffect(() => {
    if (inputMethod === 'select' && userRepos.length === 0 && hasGitHubToken) {
      fetchUserRepos()
    }
  }, [inputMethod])

  const hasGitHubToken = !!githubToken

  const fetchUserRepos = async () => {
    if (!hasGitHubToken) return

    setLoadingRepos(true)
    try {
      // ✅ FIXED: No credentials, just token
      const response = await axios.get(
        'https://api.github.com/user/repos?sort=updated&per_page=100',
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/json'
          },
          withCredentials: false // This is key!
        }
      )
      setUserRepos(response.data)
      console.log(`📂 Loaded ${response.data.length} repositories`)
    } catch (err) {
      console.error('Failed to fetch repos:', err)
      setError(
        'Failed to load your repositories: ' +
          (err.response?.data?.message || err.message)
      )
    } finally {
      setLoadingRepos(false)
    }
  }

  const fetchAnalyses = async () => {
    setLoadingHistory(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/repo/my-analyses`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAnalyses(response.data.analyses || [])
    } catch (err) {
      console.error('Failed to fetch analyses:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const analyzeRepo = async () => {
    console.log('🔍 Analyze button clicked')
    console.log('Repo URL:', repoUrl)
    console.log('Has token:', hasGitHubToken)
    console.log('API URL:', `${API_BASE_URL}/api/repo/analyze`)

    if (!repoUrl) {
      setError('Please enter or select a GitHub repository URL')
      return
    }

    if (!hasGitHubToken) {
      setError('Please login with GitHub first')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setDebugInfo('Starting analysis...')
    setAnalysis(null)
    setPrUrl('')

    try {
      const token = localStorage.getItem('token')
      console.log('JWT Token exists:', !!token)

      const response = await axios.post(
        `${API_BASE_URL}/api/repo/analyze`,
        {
          repoUrl,
          accessToken: githubToken
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      )

      console.log('✅ Analysis response:', response.data)
      setDebugInfo('✅ Analysis successful!')
      setAnalysis(response.data)
      setAnalysisId(response.data.analysisId)
      setActiveTab('results')
      setSuccess(
        `✅ Analysis complete! Found ${response.data.bugs} bugs in ${response.data.files} files.`
      )

      fetchAnalyses()
    } catch (err) {
      console.error('❌ Analysis failed:', err)

      if (err.response) {
        console.error('Error response data:', err.response.data)
        console.error('Error response status:', err.response.status)
        setError(
          `Server error (${err.response.status}): ${
            err.response.data?.error || err.message
          }`
        )
        setDebugInfo(`❌ Server responded with status ${err.response.status}`)
      } else if (err.request) {
        console.error('No response received:', err.request)
        setError(
          `No response from server. Is repo-fixer-service running on port ${API_PORT}?`
        )
        setDebugInfo(`❌ No response from server on port ${API_PORT}`)
      } else {
        console.error('Request setup error:', err.message)
        setError(`Request failed: ${err.message}`)
        setDebugInfo(`❌ ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const fixRepo = async () => {
    if (!analysisId) return

    setFixing(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')

      const response = await axios.post(
        `${API_BASE_URL}/api/repo/fix`,
        {
          analysisId,
          accessToken: githubToken
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      )

      console.log('✅ PR created:', response.data)
      setPrUrl(response.data.prUrl)
      setSuccess(
        `✅ Pull Request created! Fixed ${response.data.fixedFiles} files.`
      )
      setActiveTab('pr')

      fetchAnalyses()
    } catch (err) {
      console.error('❌ Fix failed:', err)

      if (
        err.response?.data?.message ===
        '✨ Your code looks clean! No issues detected.'
      ) {
        setSuccess('✨ Your code is clean! No bugs found to fix.')
        setError('')
      } else if (err.response?.data?.error === 'No changes to commit') {
        setError(
          "⚠️ No changes were made. The fixes didn't produce any actual changes."
        )
      } else {
        setError(
          err.response?.data?.error || err.message || 'Failed to fix repository'
        )
      }
    } finally {
      setFixing(false)
    }
  }

  const toggleFileExpanded = filePath => {
    setExpandedFiles(prev => ({
      ...prev,
      [filePath]: !prev[filePath]
    }))
  }

  const loadAnalysis = async id => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_BASE_URL}/api/repo/analysis/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setAnalysis({
        analysisId: id,
        files: response.data.files,
        bugs: response.data.bugs,
        details: response.data.details || []
      })
      setAnalysisId(id)
      setActiveTab('results')
    } catch (err) {
      console.error('Failed to load analysis:', err)
    }
  }

  const formatDate = dateString => {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-8'>
          <div className='p-3 bg-purple-600/20 rounded-2xl'>
            <Github size={32} className='text-purple-400' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400'>
              AI GitHub Repo Fixer
            </h1>
            <p className='text-gray-400 mt-1'>
              Analyze any repository and auto-fix bugs with AI
            </p>
            <div className='flex items-center gap-2 mt-2'>
              <span className='text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded'>
                Port: {API_PORT}
              </span>
              <span className='text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded'>
                Hybrid AI: Cerebras + Groq
              </span>
            </div>
          </div>
        </div>

        {/* GitHub Status */}
        <div className='mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div
                className={`w-3 h-3 rounded-full ${
                  hasGitHubToken ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              ></div>
              <span className='text-sm font-medium'>
                GitHub:{' '}
                {hasGitHubToken
                  ? `Connected as ${user?.login || user?.username}`
                  : 'Not Connected'}
              </span>
            </div>
            {hasGitHubToken && (
              <div className='text-xs text-gray-400'>
                Token: {githubToken?.substring(0, 15)}...
              </div>
            )}
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className='mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700'>
            <p className='text-sm font-mono text-gray-300'>
              Debug: {debugInfo}
            </p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className='mb-6 p-4 bg-green-900/30 rounded-xl border border-green-800 flex items-start gap-3'>
            <CheckCircle
              size={20}
              className='text-green-400 flex-shrink-0 mt-0.5'
            />
            <p className='text-green-300 text-sm'>{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className='mb-6 p-4 bg-red-900/30 rounded-xl border border-red-800 flex items-start gap-3'>
            <AlertCircle
              size={20}
              className='text-red-400 flex-shrink-0 mt-0.5'
            />
            <p className='text-red-300 text-sm'>{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className='flex gap-1 mb-6 bg-gray-800/30 p-1 rounded-xl'>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition ${
              activeTab === 'import'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            🔍 Import & Analyze
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!analysis}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition ${
              !analysis ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              activeTab === 'results'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            📊 Results {analysis && `(${analysis.bugs} bugs)`}
          </button>
          <button
            onClick={() => setActiveTab('pr')}
            disabled={!prUrl}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition ${
              !prUrl ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              activeTab === 'pr'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            🚀 Pull Request
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            📜 History
          </button>
        </div>

        {/* ========== IMPORT TAB ========== */}
        {activeTab === 'import' && (
          <div className='bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700'>
            <div className='space-y-6'>
              {/* Input Method Toggle */}
              <div className='flex gap-2 p-1 bg-gray-700/30 rounded-lg'>
                <button
                  onClick={() => setInputMethod('url')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                    inputMethod === 'url'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Link2 size={16} />
                  Enter URL
                </button>
                <button
                  onClick={() => setInputMethod('select')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                    inputMethod === 'select'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FolderGit2 size={16} />
                  Select from GitHub
                </button>
              </div>

              {/* URL Input Method */}
              {inputMethod === 'url' && (
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    GitHub Repository URL
                  </label>
                  <input
                    type='text'
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    placeholder='https://github.com/facebook/react'
                    className='w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                  <p className='text-xs text-gray-400 mt-2'>
                    Enter any public GitHub repository URL
                  </p>
                </div>
              )}

              {/* Select Repository Method */}
              {inputMethod === 'select' && (
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Select Your Repository
                  </label>

                  {loadingRepos ? (
                    <div className='flex items-center justify-center py-8 bg-gray-900/50 rounded-xl'>
                      <Loader2
                        size={24}
                        className='animate-spin text-purple-400'
                      />
                      <span className='ml-2 text-gray-400'>
                        Loading your repositories...
                      </span>
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedRepo}
                        onChange={e => {
                          setSelectedRepo(e.target.value)
                          setRepoUrl(e.target.value)
                        }}
                        className='w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      >
                        <option value=''>-- Select a repository --</option>
                        {userRepos.map(repo => (
                          <option key={repo.id} value={repo.html_url}>
                            {repo.full_name} {repo.private ? '🔒' : '🌍'} -{' '}
                            {repo.updated_at?.split('T')[0]}
                          </option>
                        ))}
                      </select>

                      <div className='flex justify-end mt-2'>
                        <button
                          onClick={fetchUserRepos}
                          className='text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1'
                        >
                          <RefreshCw size={12} />
                          Refresh list
                        </button>
                      </div>
                    </>
                  )}

                  <p className='text-xs text-gray-400 mt-2'>
                    Select from your public and private repositories
                  </p>
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={analyzeRepo}
                disabled={loading || !hasGitHubToken || !repoUrl}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                  loading || !hasGitHubToken || !repoUrl
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className='animate-spin' />
                    Analyzing Repository...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Import & Analyze Repository
                  </>
                )}
              </button>

              {/* Test button */}
              <button
                onClick={async () => {
                  try {
                    const response = await axios.get(`${API_BASE_URL}/health`)
                    setDebugInfo(
                      `✅ Service is running: ${JSON.stringify(response.data)}`
                    )
                  } catch (err) {
                    setDebugInfo(`❌ Service not reachable: ${err.message}`)
                  }
                }}
                className='w-full mt-2 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm'
              >
                Test Service Connection
              </button>
            </div>
          </div>
        )}

        {/* ========== RESULTS TAB ========== */}
        {activeTab === 'results' && analysis && (
          <div className='bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700'>
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gray-900/60 rounded-xl p-6 text-center'>
                  <p className='text-4xl font-bold text-blue-400'>
                    {analysis.files}
                  </p>
                  <p className='text-sm text-gray-400 mt-1'>Files Analyzed</p>
                </div>
                <div className='bg-gray-900/60 rounded-xl p-6 text-center'>
                  <p className='text-4xl font-bold text-yellow-400'>
                    {analysis.bugs}
                  </p>
                  <p className='text-sm text-gray-400 mt-1'>Bugs Found</p>
                </div>
              </div>

              {analysis.details && analysis.details.length > 0 && (
                <div className='mt-4'>
                  <h3 className='text-sm font-medium text-gray-300 mb-3'>
                    Files analyzed:
                  </h3>
                  <div className='max-h-96 overflow-y-auto space-y-2 pr-2'>
                    {analysis.details.map((file, idx) => (
                      <div
                        key={idx}
                        className='bg-gray-900/40 rounded-lg border border-gray-700 overflow-hidden'
                      >
                        <div
                          className='flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800/50'
                          onClick={() => toggleFileExpanded(file.path)}
                        >
                          <div className='flex items-center gap-2'>
                            <FileCode size={16} className='text-blue-400' />
                            <span className='font-mono text-sm text-blue-300 truncate max-w-md'>
                              {file.path}
                            </span>
                          </div>
                          <div className='flex items-center gap-3'>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                file.issues > 0
                                  ? 'bg-yellow-900/50 text-yellow-300'
                                  : 'bg-green-900/50 text-green-300'
                              }`}
                            >
                              {file.issues}{' '}
                              {file.issues === 1 ? 'issue' : 'issues'}
                            </span>
                            {expandedFiles[file.path] ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </div>
                        </div>

                        {/* Expanded file details */}
                        {expandedFiles[file.path] && (
                          <div className='p-3 border-t border-gray-700 bg-gray-900/20'>
                            <pre className='text-xs text-gray-300 overflow-x-auto'>
                              {file.content?.substring(0, 300)}...
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={fixRepo}
                disabled={fixing || analysis.bugs === 0}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                  fixing || analysis.bugs === 0
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {fixing ? (
                  <>
                    <Loader2 size={20} className='animate-spin' />
                    Fixing Bugs & Creating PR...
                  </>
                ) : analysis.bugs === 0 ? (
                  <>
                    <CheckCircle size={20} />
                    No Bugs to Fix
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    Fix All Bugs & Create Pull Request
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========== PR TAB ========== */}
        {activeTab === 'pr' && prUrl && (
          <div className='bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center'>
            <div className='w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6'>
              <CheckCircle size={40} className='text-green-400' />
            </div>
            <h3 className='text-2xl font-bold text-green-400 mb-2'>
              Pull Request Created!
            </h3>
            <p className='text-gray-300 mb-6'>
              Your fixes are ready for review on GitHub
            </p>

            <a
              href={prUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold transition'
            >
              <ExternalLink size={18} />
              View Pull Request
            </a>

            <button
              onClick={() => {
                setActiveTab('import')
                setRepoUrl('')
                setSelectedRepo('')
                setAnalysis(null)
                setPrUrl('')
              }}
              className='block w-full mt-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition'
            >
              Fix Another Repository
            </button>
          </div>
        )}

        {/* ========== HISTORY TAB ========== */}
        {activeTab === 'history' && (
          <div className='bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-lg font-semibold text-white'>
                Your Analysis History
              </h3>
              <button
                onClick={fetchAnalyses}
                className='flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg'
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {loadingHistory ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 size={32} className='animate-spin text-purple-400' />
              </div>
            ) : analyses.length === 0 ? (
              <div className='text-center py-12 text-gray-400'>
                <Clock size={48} className='mx-auto mb-4 opacity-50' />
                <p>No analysis history yet</p>
                <p className='text-sm mt-2'>
                  Import a repository to get started!
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {analyses.map(item => (
                  <div
                    key={item.id}
                    className='bg-gray-900/40 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition cursor-pointer'
                    onClick={() => loadAnalysis(item.id)}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <Github size={16} className='text-gray-400' />
                          <span className='font-medium text-white'>
                            {item.repoName || item.repoUrl}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              item.status === 'fixed'
                                ? 'bg-green-900/50 text-green-300'
                                : item.status === 'analyzed'
                                ? 'bg-blue-900/50 text-blue-300'
                                : 'bg-yellow-900/50 text-yellow-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className='flex items-center gap-4 text-xs text-gray-400'>
                          <span>📁 {item.files} files</span>
                          <span>🐛 {item.bugs} bugs</span>
                          <span>📅 {formatDate(item.date)}</span>
                        </div>
                        {item.prUrl && (
                          <a
                            href={item.prUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 text-xs text-green-400 mt-2 hover:underline'
                            onClick={e => e.stopPropagation()}
                          >
                            <GitBranch size={12} />
                            View PR
                          </a>
                        )}
                      </div>
                      <ChevronUp size={20} className='text-gray-500' />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RepoFixer
