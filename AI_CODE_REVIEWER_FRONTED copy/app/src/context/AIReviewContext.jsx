// import { createContext, useContext, useState, useEffect, useRef } from 'react'
// import axios from 'axios'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from './AuthContext' // Import useAuth

// export const AIReviewContext = createContext()

// export const AIReviewProvider = ({ children }) => {
//   const [output, setOutput] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [connectionStatus, setConnectionStatus] = useState('ready')
//   const [connectionError, setConnectionError] = useState('')
//   const [chatHistory, setChatHistory] = useState([])

//   const pollingInterval = useRef(null)
//   const aiRequestTimeout = useRef(null)
//   const retryCount = useRef(0)
//   const currentRequestId = useRef(null)
//   const lastMessageCount = useRef(0)
//   const currentPollingUserId = useRef(null)

//   const navigate = useNavigate()
//   const { user, isAuthenticated } = useAuth() // Get user from AuthContext

//   // -------------------------
//   // Get Current User - ALWAYS from AuthContext
//   // -------------------------
//   const getCurrentUser = () => {
//     if (!isAuthenticated || !user) {
//       return null
//     }
    
//     const userId = user._id || user.userId || user.id
//     const userName = user.username || user.name || 'User'
    
//     return {
//       id: userId,
//       name: userName,
//       raw: user
//     }
//   }

//   // -------------------------
//   // Clean up when user changes
//   // -------------------------
//   useEffect(() => {
//     const currentUser = getCurrentUser()
    
//     if (!currentUser) {
//       console.log('🚫 No authenticated user, cleaning up...')
//       cleanupAIRequest()
//       setOutput('')
//       setChatHistory([])
//       setConnectionStatus('ready')
//       return
//     }

//     console.log('✅ AI Provider - Current user:', currentUser.id)
    
//     // Load history for current user
//     getAIChatHistory()

//     return () => {
//       cleanupAIRequest()
//     }
//   }, [user, isAuthenticated]) // Re-run when user changes

//   // -------------------------
//   // Generate unique request ID
//   // -------------------------
//   const generateRequestId = () => {
//     return `ai_review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
//   }

//   // -------------------------
//   // AI Review Function - ONLY for current user
//   // -------------------------
//   const getAIReview = async (code, language) => {
//     // Get current user
//     const currentUser = getCurrentUser()
    
//     if (!currentUser) {
//       setOutput('❌ Please login first')
//       navigate('/sign-in')
//       return
//     }

//     cleanupAIRequest()

//     try {
//       setIsLoading(true)
//       setOutput('🤖 AI is analyzing your code... Please wait.')
//       setConnectionError('')
//       setConnectionStatus('processing')
//       retryCount.current = 0

//       if (!code || code.trim() === '') {
//         setOutput('❌ Please enter code to review')
//         setIsLoading(false)
//         setConnectionStatus('error')
//         return
//       }

//       // Generate unique request ID
//       currentRequestId.current = generateRequestId()

//       // Create AI message
//       const aiMessage = `Review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``

//       console.log('🤖 Sending to AI service for user:', {
//         userId: currentUser.id,
//         username: currentUser.name,
//         requestId: currentRequestId.current
//       })

//       // Submit request to AI service
//       const response = await axios.post(
//         'http://localhost:3003/api/ai/run',
//         {
//           message: aiMessage,
//           userId: currentUser.id,
//           username: currentUser.name,
//           requestId: currentRequestId.current
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           timeout: 15000
//         }
//       )

//       console.log('✅ AI request submitted:', response.data)

//       // Get current message count before polling
//       try {
//         const historyResponse = await axios.get(
//           `http://localhost:3003/api/ai/history/${currentUser.id}`,
//           { timeout: 5000 }
//         )
//         lastMessageCount.current = historyResponse.data.messages?.length || 0
//         console.log(`📊 Initial message count: ${lastMessageCount.current}`)
//       } catch (err) {
//         console.log('Could not get initial message count:', err.message)
//         lastMessageCount.current = 0
//       }

//       setOutput('✅ Code submitted for AI review. Checking for response...')
//       setConnectionStatus('waiting_for_response')
      
//       // Start polling for result
//       currentPollingUserId.current = currentUser.id
//       startPolling(currentUser.id)
      
//       // Set timeout
//       aiRequestTimeout.current = setTimeout(() => {
//         if (isLoading) {
//           setOutput('❌ AI review timeout after 90 seconds. Please try again.')
//           setIsLoading(false)
//           setConnectionStatus('timeout')
//           cleanupAIRequest()
//         }
//       }, 90000)

//     } catch (error) {
//       console.error('❌ AI Review error:', error)
      
//       let errorMessage = 'Failed to submit code for AI review'
      
//       if (error.response) {
//         errorMessage = `AI Service error: ${error.response.status}`
//       } else if (error.request) {
//         errorMessage = "Cannot connect to AI service."
//       }
      
//       setOutput(`❌ ${errorMessage}`)
//       setIsLoading(false)
//       setConnectionStatus('error')
//       setConnectionError(errorMessage)
//     }
//   }

//   // -------------------------
//   // Poll for AI Result - ONLY for specific user
//   // -------------------------
//   const startPolling = (userId) => {
//     console.log(`🔄 Starting HTTP polling for user: ${userId}`)
    
//     pollAIResult(userId)
    
//     pollingInterval.current = setInterval(() => {
//       pollAIResult(userId)
//     }, 2000)
//   }

//   const pollAIResult = async (userId) => {
//     // Verify this is still the current user
//     const currentUser = getCurrentUser()
    
//     if (!currentUser || currentUser.id !== userId) {
//       console.log(`🚫 Polling stopped - user mismatch or logged out`)
//       cleanupAIRequest()
//       return
//     }

//     // Don't poll if we're polling for a different user
//     if (currentPollingUserId.current !== userId) {
//       console.log(`⚠️ Polling stopped - user ID mismatch`)
//       return
//     }

//     try {
//       retryCount.current += 1
      
//       const response = await axios.get(
//         `http://localhost:3003/api/ai/history/${userId}`,
//         {
//           timeout: 5000
//         }
//       )

//       if (response.data && response.data.messages && response.data.messages.length > 0) {
//         const messages = response.data.messages
//         const currentCount = messages.length
        
//         // Check if we have new messages
//         if (currentCount > lastMessageCount.current) {
//           const newMessages = messages.slice(lastMessageCount.current)
//           console.log(`🆕 Found ${newMessages.length} new messages`)
          
//           // Look for AI responses (case insensitive)
//           const newAIMessages = newMessages.filter(msg => 
//             msg.sender?.toLowerCase() === 'ai'
//           )
          
//           if (newAIMessages.length > 0) {
//             const latestAIMessage = newAIMessages[0]
            
//             console.log('✅ Found new AI response!')
            
//             setOutput(`🤖 AI Review:\n\n${latestAIMessage.content}`)
//             setIsLoading(false)
//             setConnectionStatus('completed')
//             setChatHistory(messages)
            
//             lastMessageCount.current = currentCount
//             cleanupAIRequest()
//             return true
//           }
//         }
        
//         lastMessageCount.current = currentCount
//       }
      
//       // Status messages
//       if (retryCount.current === 10) {
//         setOutput('⏳ AI is processing... This may take 30-60 seconds.')
//       } else if (retryCount.current === 20) {
//         setOutput('⏳ Still waiting for AI response...')
//       } else if (retryCount.current === 30) {
//         setOutput('⚠️ AI is taking longer than expected.')
//       }
      
//     } catch (err) {
//       console.log('Polling error:', err.message)
      
//       if (retryCount.current >= 30) {
//         setOutput('⚠️ Connection issue. Please try again.')
//         setConnectionStatus('error')
//         cleanupAIRequest()
//       }
//     }
    
//     return false
//   }

//   // -------------------------
//   // Get AI Chat History - ONLY for current user
//   // -------------------------
//   const getAIChatHistory = async () => {
//     const currentUser = getCurrentUser()
    
//     if (!currentUser) {
//       console.log('🚫 No authenticated user, clearing history')
//       setChatHistory([])
//       return []
//     }

//     try {
//       console.log('📜 Fetching chat history for user:', currentUser.id)

//       const response = await axios.get(
//         `http://localhost:3003/api/ai/history/${currentUser.id}`,
//         {
//           timeout: 5000
//         }
//       )

//       const messages = response.data.messages || []
      
//       // Only update if messages have changed AND it's still the same user
//       if (getCurrentUser()?.id === currentUser.id) {
//         if (JSON.stringify(messages) !== JSON.stringify(chatHistory)) {
//           setChatHistory(messages)
//         }
//         lastMessageCount.current = messages.length
//       }
      
//       return messages
//     } catch (err) {
//       console.log('History fetch error:', err.message)
//       return []
//     }
//   }

//   // -------------------------
//   // Check AI Result Manually
//   // -------------------------
//   const checkAIResultManually = async () => {
//     const currentUser = getCurrentUser()
    
//     if (!currentUser) {
//       setOutput('❌ Please login first')
//       return
//     }

//     try {
//       const response = await axios.get(
//         `http://localhost:3003/api/ai/history/${currentUser.id}`,
//         {
//           timeout: 5000
//         }
//       )

//       if (response.data && response.data.messages && response.data.messages.length > 0) {
//         const messages = response.data.messages
//         const aiMessages = messages.filter(msg => 
//           msg.sender?.toLowerCase() === 'ai'
//         )
        
//         if (aiMessages.length > 0) {
//           const latestAIMessage = aiMessages[0]
//           setOutput(`🤖 Latest AI Review:\n\n${latestAIMessage.content}`)
//           setConnectionStatus('completed')
//           setChatHistory(messages)
//         } else {
//           setOutput('❌ No AI reviews found')
//           setConnectionStatus('no_history')
//         }
//       } else {
//         setOutput('❌ No chat history found')
//         setConnectionStatus('no_history')
//       }
//     } catch (err) {
//       setOutput(`❌ Error: ${err.message}`)
//       setConnectionStatus('error')
//     }
//   }

//   // -------------------------
//   // Test Functions
//   // -------------------------
//   const testAIServiceDirectly = async () => {
//     try {
//       setConnectionStatus('testing')
//       setOutput('Testing AI service...')
      
//       const response = await axios.get('http://localhost:3003/api/ai/health', {
//         timeout: 5000
//       })
      
//       setOutput(`✅ AI Service is healthy!`)
//       setConnectionStatus('ready')
//       return response.data
//     } catch (error) {
//       setOutput(`❌ AI Service test failed: ${error.message}`)
//       setConnectionStatus('error')
//       throw error
//     }
//   }

//   const testAllServices = async () => {
//     try {
//       setConnectionStatus('testing')
//       setOutput('Testing all services...')
      
//       const aiResponse = await axios.get('http://localhost:3003/api/ai/health', {
//         timeout: 5000
//       })
      
//       const editorResponse = await axios.get('http://localhost:3002/health', {
//         timeout: 5000
//       })
      
//       setConnectionStatus('all_services_ok')
//       setOutput(`✅ All services are running!`)
      
//       return {
//         ai: aiResponse.data,
//         editor: editorResponse.data
//       }
//     } catch (error) {
//       setConnectionStatus('connection_error')
//       setOutput(`❌ Connection test failed: ${error.message}`)
//       throw error
//     }
//   }

//   // -------------------------
//   // Cleanup
//   // -------------------------
//   const cleanupAIRequest = () => {
//     if (pollingInterval.current) {
//       clearInterval(pollingInterval.current)
//       pollingInterval.current = null
//     }
//     if (aiRequestTimeout.current) {
//       clearTimeout(aiRequestTimeout.current)
//       aiRequestTimeout.current = null
//     }
//     retryCount.current = 0
//     currentPollingUserId.current = null
//   }

//   const clearOutput = () => {
//     setOutput('')
//     cleanupAIRequest()
//     setConnectionStatus('ready')
//     setConnectionError('')
//   }

//   const getConnectionDetails = () => {
//     const currentUser = getCurrentUser()
//     return {
//       userId: currentUser?.id || null,
//       connectionStatus,
//       mode: 'HTTP',
//       currentRequestId: currentRequestId.current,
//       polling: !!pollingInterval.current,
//       retryCount: retryCount.current,
//       messageCount: lastMessageCount.current
//     }
//   }

//   // -------------------------
//   // Context Value
//   // -------------------------
//   const contextValue = {
//     // State
//     output,
//     setOutput,
//     isLoading,
//     connectionError,
//     connectionStatus,
//     chatHistory,
//     setChatHistory,

//     // Actions
//     getAIReview,
//     getAIChatHistory,
//     clearOutput,
//     checkAIResultManually,
//     testAllServices,
    
//     // Test functions
//     testAIServiceDirectly,
//     getConnectionDetails,

//     // User info
//     userId: getCurrentUser()?.id || null,
//     username: getCurrentUser()?.name || null
//   }

//   return (
//     <AIReviewContext.Provider value={contextValue}>
//       {children}
//     </AIReviewContext.Provider>
//   )
// }

// export const useAIReview = () => {
//   const context = useContext(AIReviewContext)
//   if (!context) {
//     throw new Error('useAIReview must be used within AIReviewProvider')
//   }
//   return context
// }




import { createContext, useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export const AIReviewContext = createContext()

export const AIReviewProvider = ({ children }) => {
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('ready')
  const [connectionError, setConnectionError] = useState('')
  const [chatHistory, setChatHistory] = useState([])

  const pollingInterval = useRef(null)
  const aiRequestTimeout = useRef(null)
  const retryCount = useRef(0)
  const currentRequestId = useRef(null)
  const lastMessageCount = useRef(0)
  const currentPollingUserId = useRef(null)
  const isRequestInProgress = useRef(false) // ADD THIS - Prevent duplicate requests

  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  // -------------------------
  // Get Current User - ALWAYS from AuthContext
  // -------------------------
  const getCurrentUser = () => {
    if (!isAuthenticated || !user) {
      return null
    }
    
    const userId = user._id || user.userId || user.id
    const userName = user.username || user.name || 'User'
    
    return {
      id: userId,
      name: userName,
      raw: user
    }
  }

  // -------------------------
  // Clean up when user changes - OPTIMIZED
  // -------------------------
  useEffect(() => {
    const currentUser = getCurrentUser()
    
    if (!currentUser) {
      console.log('🚫 No authenticated user, cleaning up...')
      cleanupAIRequest()
      setOutput('')
      setChatHistory([])
      setConnectionStatus('ready')
      setConnectionError('')
      return
    }

    console.log('✅ AI Provider - Current user:', currentUser.id)
    
    // Load history for current user only once on mount/auth change
    const loadHistory = async () => {
      await getAIChatHistory()
    }
    loadHistory()

    return () => {
      cleanupAIRequest()
    }
  }, [user?.id, isAuthenticated]) // CHANGED: Only depend on user.id, not entire user object

  // -------------------------
  // Generate unique request ID
  // -------------------------
  const generateRequestId = () => {
    return `ai_review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // -------------------------
  // AI Review Function - WITH DUPLICATE PROTECTION
  // -------------------------
  const getAIReview = async (code, language) => {
    // Prevent duplicate requests
    if (isRequestInProgress.current) {
      console.log('⚠️ AI request already in progress, ignoring duplicate')
      return
    }

    // Get current user
    const currentUser = getCurrentUser()
    
    if (!currentUser) {
      setOutput('❌ Please login first')
      navigate('/sign-in')
      return
    }

    cleanupAIRequest()
    isRequestInProgress.current = true

    try {
      setIsLoading(true)
      setOutput('🤖 AI is analyzing your code... Please wait.')
      setConnectionError('')
      setConnectionStatus('processing')
      retryCount.current = 0

      if (!code || code.trim() === '') {
        setOutput('❌ Please enter code to review')
        setIsLoading(false)
        setConnectionStatus('error')
        isRequestInProgress.current = false
        return
      }

      // Generate unique request ID
      currentRequestId.current = generateRequestId()

      // Create AI message
      const aiMessage = `Review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``

      console.log('🤖 Sending to AI service for user:', {
        userId: currentUser.id,
        username: currentUser.name,
        requestId: currentRequestId.current
      })

      // Submit request to AI service
      const response = await axios.post(
        'http://localhost:3003/api/ai/run',
        {
          message: aiMessage,
          userId: currentUser.id,
          username: currentUser.name,
          requestId: currentRequestId.current
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      )

      console.log('✅ AI request submitted:', response.data)

      // Get current message count before polling
      try {
        const historyResponse = await axios.get(
          `http://localhost:3003/api/ai/history/${currentUser.id}`,
          { timeout: 5000 }
        )
        lastMessageCount.current = historyResponse.data.messages?.length || 0
        console.log(`📊 Initial message count: ${lastMessageCount.current}`)
      } catch (err) {
        console.log('Could not get initial message count:', err.message)
        lastMessageCount.current = 0
      }

      setOutput('✅ Code submitted for AI review. Checking for response...')
      setConnectionStatus('waiting_for_response')
      
      // Start polling for result
      currentPollingUserId.current = currentUser.id
      startPolling(currentUser.id)
      
      // Set timeout
      aiRequestTimeout.current = setTimeout(() => {
        if (isLoading) {
          setOutput('❌ AI review timeout after 90 seconds. Please try again.')
          setIsLoading(false)
          setConnectionStatus('timeout')
          cleanupAIRequest()
          isRequestInProgress.current = false
        }
      }, 90000)

    } catch (error) {
      console.error('❌ AI Review error:', error)
      
      let errorMessage = 'Failed to submit code for AI review'
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'AI service endpoint not found. Make sure it\'s running on port 3003.'
        } else {
          errorMessage = `AI Service error: ${error.response.status}`
        }
      } else if (error.request) {
        errorMessage = "Cannot connect to AI service. Make sure it's running on port 3003."
      }
      
      setOutput(`❌ ${errorMessage}`)
      setIsLoading(false)
      setConnectionStatus('error')
      setConnectionError(errorMessage)
      isRequestInProgress.current = false
    }
  }

  // -------------------------
  // Poll for AI Result - OPTIMIZED
  // -------------------------
  const startPolling = (userId) => {
    console.log(`🔄 Starting HTTP polling for user: ${userId}`)
    
    // Poll immediately
    pollAIResult(userId)
    
    // Then poll every 2 seconds
    pollingInterval.current = setInterval(() => {
      pollAIResult(userId)
    }, 2000)
  }

  const pollAIResult = async (userId) => {
    // Verify this is still the current user
    const currentUser = getCurrentUser()
    
    if (!currentUser || currentUser.id !== userId) {
      console.log(`🚫 Polling stopped - user mismatch or logged out`)
      cleanupAIRequest()
      isRequestInProgress.current = false
      return
    }

    // Don't poll if we're polling for a different user
    if (currentPollingUserId.current !== userId) {
      console.log(`⚠️ Polling stopped - user ID mismatch`)
      return
    }

    try {
      retryCount.current += 1
      
      const response = await axios.get(
        `http://localhost:3003/api/ai/history/${userId}`,
        {
          timeout: 5000
        }
      )

      if (response.data && response.data.messages && response.data.messages.length > 0) {
        const messages = response.data.messages
        const currentCount = messages.length
        
        // Check if we have new messages
        if (currentCount > lastMessageCount.current) {
          const newMessages = messages.slice(lastMessageCount.current)
          console.log(`🆕 Found ${newMessages.length} new messages`)
          
          // Look for AI responses (case insensitive)
          const newAIMessages = newMessages.filter(msg => 
            msg.sender?.toLowerCase() === 'ai'
          )
          
          if (newAIMessages.length > 0) {
            const latestAIMessage = newAIMessages[0]
            
            console.log('✅ Found new AI response!')
            
            setOutput(`🤖 AI Review:\n\n${latestAIMessage.content}`)
            setIsLoading(false)
            setConnectionStatus('completed')
            
            // Update chat history with new messages
            setChatHistory(prev => {
              // Merge and deduplicate messages
              const allMessages = [...prev, ...newMessages]
              const uniqueMessages = Array.from(
                new Map(allMessages.map(msg => [msg.timestamp, msg])).values()
              )
              return uniqueMessages.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
              )
            })
            
            lastMessageCount.current = currentCount
            cleanupAIRequest()
            isRequestInProgress.current = false
            return true
          }
        }
        
        lastMessageCount.current = currentCount
      }
      
      // Status messages - IMPROVED
      if (retryCount.current === 10) {
        setOutput('⏳ AI is processing... This may take 30-60 seconds.')
      } else if (retryCount.current === 20) {
        setOutput('⏳ Still waiting for AI response... The service might be busy.')
      } else if (retryCount.current === 30) {
        setOutput('⚠️ AI is taking longer than expected. Please wait...')
      }
      
    } catch (err) {
      console.log('Polling error:', err.message)
      
      if (retryCount.current >= 30) {
        setOutput('⚠️ Connection issue. Please try again.')
        setConnectionStatus('error')
        cleanupAIRequest()
        isRequestInProgress.current = false
      }
    }
    
    return false
  }

  // -------------------------
  // Get AI Chat History - WITH CACHING
  // -------------------------
  const getAIChatHistory = async (forceRefresh = false) => {
    const currentUser = getCurrentUser()
    
    if (!currentUser) {
      console.log('🚫 No authenticated user, clearing history')
      setChatHistory([])
      return []
    }

    // Don't fetch if we already have history and not forcing refresh
    if (!forceRefresh && chatHistory.length > 0) {
      console.log('📜 Using cached chat history')
      return chatHistory
    }

    try {
      console.log('📜 Fetching chat history for user:', currentUser.id)

      const response = await axios.get(
        `http://localhost:3003/api/ai/history/${currentUser.id}`,
        {
          timeout: 5000
        }
      )

      const messages = response.data.messages || []
      
      // Sort messages by timestamp (newest first)
      const sortedMessages = messages.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
      
      setChatHistory(sortedMessages)
      lastMessageCount.current = messages.length
      
      return sortedMessages
    } catch (err) {
      console.log('History fetch error:', err.message)
      return chatHistory // Return existing history on error
    }
  }

  // -------------------------
  // Check AI Result Manually
  // -------------------------
  const checkAIResultManually = async () => {
    const currentUser = getCurrentUser()
    
    if (!currentUser) {
      setOutput('❌ Please login first')
      return
    }

    try {
      setConnectionStatus('checking')
      
      const response = await axios.get(
        `http://localhost:3003/api/ai/history/${currentUser.id}`,
        {
          timeout: 5000
        }
      )

      if (response.data && response.data.messages && response.data.messages.length > 0) {
        const messages = response.data.messages
        const aiMessages = messages.filter(msg => 
          msg.sender?.toLowerCase() === 'ai'
        )
        
        if (aiMessages.length > 0) {
          const latestAIMessage = aiMessages[0]
          setOutput(`🤖 Latest AI Review:\n\n${latestAIMessage.content}`)
          setConnectionStatus('completed')
          
          // Update chat history
          const sortedMessages = messages.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          )
          setChatHistory(sortedMessages)
          lastMessageCount.current = messages.length
        } else {
          setOutput('❌ No AI reviews found')
          setConnectionStatus('no_history')
        }
      } else {
        setOutput('❌ No chat history found')
        setConnectionStatus('no_history')
      }
    } catch (err) {
      setOutput(`❌ Error: ${err.message}`)
      setConnectionStatus('error')
    }
  }

  // -------------------------
  // Test Functions
  // -------------------------
  const testAIServiceDirectly = async () => {
    try {
      setConnectionStatus('testing')
      setOutput('Testing AI service...')
      
      const response = await axios.get('http://localhost:3003/api/ai/health', {
        timeout: 5000
      })
      
      setOutput(`✅ AI Service is healthy! Running on port 3003`)
      setConnectionStatus('ready')
      return response.data
    } catch (error) {
      setOutput(`❌ AI Service test failed: ${error.message}`)
      setConnectionStatus('error')
      throw error
    }
  }

  const testAllServices = async () => {
    try {
      setConnectionStatus('testing')
      setOutput('Testing all services...')
      
      const aiResponse = await axios.get('http://localhost:3003/api/ai/health', {
        timeout: 5000
      })
      
      const editorResponse = await axios.get('http://localhost:3002/health', {
        timeout: 5000
      })
      
      setConnectionStatus('all_services_ok')
      setOutput(`✅ All services are running!\n\n🤖 AI Service: Port 3003\n📝 Editor Service: Port 3002`)
      
      return {
        ai: aiResponse.data,
        editor: editorResponse.data
      }
    } catch (error) {
      setConnectionStatus('connection_error')
      setOutput(`❌ Connection test failed: ${error.message}`)
      throw error
    }
  }

  // -------------------------
  // Cleanup
  // -------------------------
  const cleanupAIRequest = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current)
      pollingInterval.current = null
    }
    if (aiRequestTimeout.current) {
      clearTimeout(aiRequestTimeout.current)
      aiRequestTimeout.current = null
    }
    retryCount.current = 0
    currentPollingUserId.current = null
    // Don't reset isRequestInProgress here - handled separately
  }

  const clearOutput = () => {
    setOutput('')
    cleanupAIRequest()
    setConnectionStatus('ready')
    setConnectionError('')
    isRequestInProgress.current = false
  }

  const refreshHistory = async () => {
    await getAIChatHistory(true) // Force refresh
  }

  const getConnectionDetails = () => {
    const currentUser = getCurrentUser()
    return {
      userId: currentUser?.id || null,
      connectionStatus,
      mode: 'HTTP',
      currentRequestId: currentRequestId.current,
      polling: !!pollingInterval.current,
      retryCount: retryCount.current,
      messageCount: lastMessageCount.current,
      requestInProgress: isRequestInProgress.current
    }
  }

  // -------------------------
  // Context Value
  // -------------------------
  const contextValue = {
    // State
    output,
    setOutput,
    isLoading,
    connectionError,
    connectionStatus,
    chatHistory,
    setChatHistory,

    // Actions
    getAIReview,
    getAIChatHistory,
    clearOutput,
    checkAIResultManually,
    testAllServices,
    refreshHistory, // ADDED - Manual refresh
    
    // Test functions
    testAIServiceDirectly,
    getConnectionDetails,

    // User info
    userId: getCurrentUser()?.id || null,
    username: getCurrentUser()?.name || null
  }

  return (
    <AIReviewContext.Provider value={contextValue}>
      {children}
    </AIReviewContext.Provider>
  )
}

export const useAIReview = () => {
  const context = useContext(AIReviewContext)
  if (!context) {
    throw new Error('useAIReview must be used within AIReviewProvider')
  }
  return context
}