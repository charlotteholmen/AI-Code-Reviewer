import { createContext, useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export const CodeEditorContext = createContext()

export const CodeEditorProvider = ({ children }) => {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [editorStatus, setEditorStatus] = useState('ready')
  const [userToken, setUserToken] = useState('')

  const pollingInterval = useRef(null)
  const requestTimeout = useRef(null)

  const navigate = useNavigate()

  // Helper function to get token from cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
  }

  // -------------------------
  // Initialize User and Token
  // -------------------------
  useEffect(() => {
    console.log('🔍 Initializing CodeEditorProvider...')
    
    const initializeUser = () => {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        console.log('❌ No user found in localStorage')
        navigate('/sign-in')
        return null
      }

      try {
        const user = JSON.parse(storedUser)
        const userID = user._id || user.userId || ''
        
        if (!userID) {
          console.log('❌ No user ID found in user object')
          return null
        }

        // Get token from cookies
        const token = getCookie('token')
        console.log('🔑 Token for editor:', token ? `Length: ${token.length}` : 'NOT FOUND')
        
        setUserToken(token || '')

        console.log('✅ Editor User loaded:', { 
          userId: userID, 
          username: user.username,
          hasToken: !!token 
        })
        
        setUserId(userID)
        return { userID, token }
      } catch (err) {
        console.error('❌ Error parsing user from localStorage:', err)
        navigate('/sign-in')
        return null
      }
    }

    initializeUser()

    return () => {
      console.log('🧹 Cleaning up editor...')
      cleanupRequest()
    }
  }, [navigate])

  // -------------------------
  // Get Auth Headers
  // -------------------------
  const getAuthHeaders = () => {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`
    }
    
    return headers
  }

  // -------------------------
  // Run Code Function
  // -------------------------
  const runCode = async () => {
    cleanupRequest()

    try {
      setIsLoading(true)
      setOutput('Executing code...')
      setEditorStatus('executing')

      // Get user
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        setOutput('❌ Please login first')
        setIsLoading(false)
        setEditorStatus('error')
        navigate('/sign-in')
        return
      }

      const user = JSON.parse(storedUser)
      const userId = user._id || user.userId

      if (!code || code.trim() === '') {
        setOutput('❌ Please enter code to execute')
        setIsLoading(false)
        setEditorStatus('error')
        return
      }

      console.log('🚀 Sending code to editor service (3002):', {
        userId: userId,
        language: language,
        codeLength: code.length,
        hasToken: !!userToken
      })

      // Submit code to editor service
      const response = await axios.post(
        'http://localhost:3002/editor/run',
        {
          code: code,
          language: language
        },
        {
          headers: getAuthHeaders(),
          timeout: 10000,
          withCredentials: true
        }
      )

      console.log('✅ Code submitted:', response.data)

      if (response.data.message && response.data.message.includes('submitted')) {
        setOutput('✅ Code submitted for execution. Waiting for result...')
        setEditorStatus('waiting')
        
        // Start polling for result
        startPolling()
        
        // Set timeout
        requestTimeout.current = setTimeout(() => {
          if (isLoading) {
            setOutput('❌ Execution timeout after 30 seconds.')
            setIsLoading(false)
            setEditorStatus('timeout')
            cleanupRequest()
          }
        }, 30000)
        
      } else {
        setOutput(`❌ Error: ${response.data.error || 'Unknown error'}`)
        setIsLoading(false)
        setEditorStatus('error')
      }

    } catch (error) {
      console.error('❌ Run Code error:', error)
      
      let errorMessage = 'Failed to execute code'
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.'
          setUserToken('')
          localStorage.removeItem('user')
          navigate('/sign-in')
        } else {
          errorMessage = `Server error: ${error.response.status}`
        }
      } else if (error.request) {
        errorMessage = "Cannot connect to editor service."
      }
      
      setOutput(`❌ ${errorMessage}`)
      setIsLoading(false)
      setEditorStatus('error')
    }
  }

  // -------------------------
  // Poll for Execution Result
  // -------------------------
  const startPolling = () => {
    console.log('🔄 Starting polling for execution result...')
    
    pollExecutionResult()
    
    pollingInterval.current = setInterval(() => {
      pollExecutionResult()
    }, 2000)
  }

  const pollExecutionResult = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3002/editor/result`,
        {
          headers: getAuthHeaders(),
          timeout: 5000,
          withCredentials: true
        }
      )

      if (response.data && response.data.output) {
        console.log('✅ Execution result found!')
        setOutput(response.data.output)
        setIsLoading(false)
        setEditorStatus('completed')
        cleanupRequest()
      }
      
    } catch (err) {
      console.log('Polling error:', err.message)
    }
  }

  // -------------------------
  // Get Result from Database
  // -------------------------
  const getResultFromDB = async () => {
    try {
      setEditorStatus('checking')
      
      const response = await axios.get(
        'http://localhost:3002/editor/result',
        {
          headers: getAuthHeaders(),
          timeout: 5000,
          withCredentials: true
        }
      )

      if (response.data && response.data.output) {
        setOutput(response.data.output)
        setEditorStatus('completed')
      } else {
        setOutput('❌ No execution result found')
        setEditorStatus('no_result')
      }
    } catch (err) {
      setOutput(`❌ Error: ${err.message}`)
      setEditorStatus('error')
    }
  }

  // -------------------------
  // Test Connection
  // -------------------------
  const testConnection = async () => {
    try {
      setEditorStatus('testing')
      setOutput('Testing connection to editor service...')
      
      const response = await axios.get('http://localhost:3002/health', {
        timeout: 5000
      })
      
      setOutput(`✅ Editor service: ${JSON.stringify(response.data)}`)
      setEditorStatus('ready')
      
    } catch (error) {
      setOutput(`❌ Connection failed: ${error.message}`)
      setEditorStatus('error')
    }
  }

  // -------------------------
  // Test Auth
  // -------------------------
  const testAuth = async () => {
    try {
      setEditorStatus('testing')
      setOutput('Testing authentication...')
      
      const response = await axios.get('http://localhost:3002/editor/result', {
        headers: getAuthHeaders(),
        timeout: 5000,
        withCredentials: true
      })
      
      setOutput(`✅ Auth successful: ${JSON.stringify(response.data)}`)
      setEditorStatus('ready')
      
    } catch (error) {
      setOutput(`❌ Auth failed: ${error.message}`)
      setEditorStatus('error')
    }
  }

  // -------------------------
  // Cleanup
  // -------------------------
  const cleanupRequest = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current)
      pollingInterval.current = null
    }
    if (requestTimeout.current) {
      clearTimeout(requestTimeout.current)
      requestTimeout.current = null
    }
  }

  // -------------------------
  // Context Value
  // -------------------------
  const contextValue = {
    // State
    code,
    setCode,
    language,
    setLanguage,
    output,
    setOutput,
    isLoading,
    userId,
    editorStatus,
    userToken,

    // Actions
    runCode,
    getResultFromDB,
    testConnection,
    testAuth,

    // For compatibility
    isConnected: true,
    connectionError: '',
    testWebSocketConnection: testConnection,
    
    // Helper
    getCookie
  }

  return (
    <CodeEditorContext.Provider value={contextValue}>
      {children}
    </CodeEditorContext.Provider>
  )
}

export const useCodeEditor = () => {
  const context = useContext(CodeEditorContext)
  if (!context) {
    throw new Error('useCodeEditor must be used within CodeEditorProvider')
  }
  return context
}