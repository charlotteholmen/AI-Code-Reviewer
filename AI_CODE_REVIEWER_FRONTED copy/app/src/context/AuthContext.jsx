// // // context/AuthContext.jsx - Add proper cleanup
// // import { createContext, useContext, useState, useEffect } from 'react'
// // import axios from 'axios'
// // import { useNavigate } from 'react-router-dom'

// // export const AuthContext = createContext()

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null)
// //   const [loading, setLoading] = useState(true)
// //   const navigate = useNavigate()

// //   useEffect(() => {
// //     // Check for stored user on mount
// //     const storedUser = localStorage.getItem('user')
// //     if (storedUser) {
// //       try {
// //         const parsedUser = JSON.parse(storedUser)
// //         setUser(parsedUser)
// //       } catch (err) {
// //         console.error('Error parsing stored user:', err)
// //         completeLogout() // Clear invalid data
// //       }
// //     }
// //     setLoading(false)
// //   }, [])

// //   // COMPLETE LOGOUT - Clear EVERYTHING
// //   const completeLogout = () => {
// //     console.log('🧹 COMPLETE LOGOUT - Clearing all user data')
    
// //     // Clear localStorage
// //     localStorage.removeItem('user')
// //     localStorage.removeItem('token')
// //     localStorage.clear() // Clear ALL localStorage items
    
// //     // Clear cookies
// //     document.cookie.split(";").forEach((c) => {
// //       document.cookie = c
// //         .replace(/^ +/, "")
// //         .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
// //     });
    
// //     // Clear state
// //     setUser(null)
    
// //     // Force clear axios default headers
// //     delete axios.defaults.headers.common['Authorization']
// //   }

// //   const login = async (email, password) => {
// //     try {
// //       const response = await axios.post('http://localhost:3001/api/auth/login', {
// //         email,
// //         password
// //       }, {
// //         withCredentials: true
// //       })
      
// //       const { user, token } = response.data
      
// //       // Clear any existing data first
// //       completeLogout()
      
// //       // Set new user data
// //       localStorage.setItem('user', JSON.stringify(user))
// //       if (token) {
// //         localStorage.setItem('token', token)
// //       }
      
// //       setUser(user)
// //       return response.data
// //     } catch (error) {
// //       console.error('Login error:', error)
// //       throw error
// //     }
// //   }

// //   const logout = async () => {
// //     try {
// //       // Call logout endpoint
// //       await axios.post('http://localhost:3001/api/auth/logout', {}, {
// //         withCredentials: true
// //       })
// //     } catch (error) {
// //       console.error('Logout API error:', error)
// //     } finally {
// //       // ALWAYS clear local data even if API fails
// //       completeLogout()
// //       navigate('/sign-in')
// //     }
// //   }

// //   const value = {
// //     user,
// //     setUser,
// //     login,
// //     logout,
// //     loading,
// //     isAuthenticated: !!user
// //   }

// //   return (
// //     <AuthContext.Provider value={value}>
// //       {children}
// //     </AuthContext.Provider>
// //   )
// // }

// // export const useAuth = () => {
// //   const context = useContext(AuthContext)
// //   if (!context) {
// //     throw new Error('useAuth must be used within AuthProvider')
// //   }
// //   return context
// // }





// // context/AuthContext.jsx - COMPLETE FIXED VERSION
// // import { createContext, useContext, useState, useEffect } from 'react'
// // import axios from 'axios'
// // import { useNavigate } from 'react-router-dom'

// // export const AuthContext = createContext()

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null)
// //   const [loading, setLoading] = useState(true)
// //   const navigate = useNavigate()

// //   // Base URL for auth service
// //   const API_URL = 'http://localhost:3001/api/auth'

// //   // Configure axios defaults
// //   axios.defaults.withCredentials = true

// //   useEffect(() => {
// //     // Check for stored user on mount
// //     const initializeAuth = async () => {
// //       const storedUser = localStorage.getItem('user')
// //       const storedToken = localStorage.getItem('token')
      
// //       if (storedUser && storedToken) {
// //         try {
// //           const parsedUser = JSON.parse(storedUser)
// //           // Set axios default header
// //           axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
// //           setUser(parsedUser)
// //           console.log('✅ User restored from localStorage:', parsedUser.username)
// //         } catch (err) {
// //           console.error('Error parsing stored user:', err)
// //           completeLogout()
// //         }
// //       }
// //       setLoading(false)
// //     }

// //     initializeAuth()
// //   }, [])

// //   // COMPLETE LOGOUT - Clear EVERYTHING
// //   const completeLogout = () => {
// //     console.log('🧹 COMPLETE LOGOUT - Clearing all user data')
    
// //     // Clear localStorage
// //     localStorage.removeItem('user')
// //     localStorage.removeItem('token')
// //     localStorage.removeItem('authToken')
// //     localStorage.clear()
    
// //     // Clear cookies
// //     document.cookie.split(";").forEach((c) => {
// //       document.cookie = c
// //         .replace(/^ +/, "")
// //         .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
// //     });
    
// //     // Clear state
// //     setUser(null)
    
// //     // Clear axios headers
// //     delete axios.defaults.headers.common['Authorization']
// //   }

// //   // ✅ SIGNUP FUNCTION - FIXED
// //   const signup = async (userData) => {
// //     try {
// //       setLoading(true)
// //       console.log('📝 Signup request:', { 
// //         username: userData.name, 
// //         email: userData.email 
// //       })
      
// //       const response = await axios.post(`${API_URL}/register`, {
// //         username: userData.name,
// //         email: userData.email,
// //         password: userData.password
// //       })
      
// //       const { user, token } = response.data
      
// //       // Clear any existing data first
// //       completeLogout()
      
// //       // Set new user data
// //       localStorage.setItem('user', JSON.stringify(user))
// //       if (token) {
// //         localStorage.setItem('token', token)
// //         // Set axios default header
// //         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
// //       }
      
// //       setUser(user)
// //       console.log('✅ Signup successful:', user.username)
// //       return response.data
// //     } catch (error) {
// //       console.error('❌ Signup error:', error.response?.data || error.message)
// //       throw error
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   // ✅ LOGIN FUNCTION - FIXED
// //   const login = async (email, password) => {
// //     try {
// //       setLoading(true)
// //       console.log('🔑 Login request for:', email)
      
// //       const response = await axios.post(`${API_URL}/login`, {
// //         email,
// //         password
// //       })
      
// //       const { user, token } = response.data
      
// //       // Clear any existing data first
// //       completeLogout()
      
// //       // Set new user data
// //       localStorage.setItem('user', JSON.stringify(user))
// //       if (token) {
// //         localStorage.setItem('token', token)
// //         // Set axios default header
// //         axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
// //       }
      
// //       setUser(user)
// //       console.log('✅ Login successful:', user.username)
// //       return response.data
// //     } catch (error) {
// //       console.error('❌ Login error:', error.response?.data || error.message)
// //       throw error
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   // ✅ GITHUB LOGIN FUNCTION - FIXED
// //   const GitHubLogin = () => {
// //     // Redirect to GitHub OAuth endpoint
// //     window.location.href = `${API_URL}/github`
// //   }

// //   // ✅ LOGOUT FUNCTION - FIXED
// //   const logout = async () => {
// //     try {
// //       setLoading(true)
// //       console.log('🚪 Logging out...')
      
// //       await axios.post(`${API_URL}/logout`, {})
// //     } catch (error) {
// //       console.error('Logout API error:', error)
// //     } finally {
// //       completeLogout()
// //       navigate('/sign-in')
// //       setLoading(false)
// //     }
// //   }

// //   // ✅ CHECK AUTH STATUS - FIXED
// //   const checkAuth = async () => {
// //     try {
// //       const token = localStorage.getItem('token')
// //       if (!token) return false
      
// //       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
// //       const response = await axios.get('http://localhost:3001/api/profile')
      
// //       if (response.data && response.data.user) {
// //         const userData = response.data.user
// //         localStorage.setItem('user', JSON.stringify(userData))
// //         setUser(userData)
// //         console.log('✅ Auth check successful:', userData.username)
// //         return true
// //       }
// //       return false
// //     } catch (error) {
// //       console.error('❌ Auth check failed:', error)
// //       completeLogout()
// //       return false
// //     }
// //   }

// //   // ✅ UPDATE USER PROFILE - NEW
// //   const updateUser = async (userData) => {
// //     try {
// //       setLoading(true)
// //       console.log('📝 Updating user profile...')
      
// //       const response = await axios.put('http://localhost:3001/api/profile', userData)
      
// //       const updatedUser = response.data.user
      
// //       // Update localStorage
// //       localStorage.setItem('user', JSON.stringify(updatedUser))
      
// //       // Update state
// //       setUser(updatedUser)
      
// //       console.log('✅ Profile updated successfully')
// //       return response.data
// //     } catch (error) {
// //       console.error('❌ Profile update failed:', error)
// //       throw error
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const value = {
// //     user,
// //     setUser,
// //     signup,
// //     login,
// //     logout,
// //     GitHubLogin,
// //     checkAuth,
// //     updateUser,
// //     loading,
// //     isAuthenticated: !!user
// //   }

// //   return (
// //     <AuthContext.Provider value={value}>
// //       {children}
// //     </AuthContext.Provider>
// //   )
// // }

// // export const useAuth = () => {
// //   const context = useContext(AuthContext)
// //   if (!context) {
// //     throw new Error('useAuth must be used within AuthProvider')
// //   }
// //   return context
// // }




// // new with mcp 

// // context/AuthContext.jsx - COMPLETE FIXED VERSION
// // context/AuthContext.jsx - SIMPLIFIED VERSION
// import { createContext, useContext, useState, useEffect } from 'react'
// import axios from 'axios'
// import { useNavigate } from 'react-router-dom'

// export const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const navigate = useNavigate()

//   const API_URL = 'http://localhost:3001/api/auth'

//   // Configure axios defaults
//   axios.defaults.withCredentials = true

//   // Load user from localStorage on mount
//   useEffect(() => {
//     const loadUser = () => {
//       const token = localStorage.getItem('token');
//       const storedUser = localStorage.getItem('user');
      
//       if (token && storedUser) {
//         try {
//           const parsedUser = JSON.parse(storedUser);
//           axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//           setUser(parsedUser);
//           console.log('✅ User restored:', parsedUser.username || parsedUser.login);
//         } catch (err) {
//           console.error('Error parsing stored user:', err);
//           localStorage.removeItem('token');
//           localStorage.removeItem('user');
//         }
//       }
//       setLoading(false);
//     };

//     loadUser();

//     // Listen for storage changes (for multiple tabs)
//     const handleStorageChange = () => {
//       const token = localStorage.getItem('token');
//       const storedUser = localStorage.getItem('user');
//       if (token && storedUser) {
//         try {
//           const parsedUser = JSON.parse(storedUser);
//           setUser(parsedUser);
//         } catch (err) {
//           console.error('Error parsing stored user on storage change:', err);
//         }
//       } else {
//         setUser(null);
//       }
//     };

//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   // Login function
//   const login = async (email, password) => {
//     try {
//       const response = await axios.post(`${API_URL}/login`, { email, password });
//       const { user, token } = response.data;
      
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user));
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       setUser(user);
      
//       return response.data;
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   };

//   // Signup function
//   const signup = async (userData) => {
//     try {
//       const response = await axios.post(`${API_URL}/register`, {
//         username: userData.name,
//         email: userData.email,
//         password: userData.password
//       });
      
//       const { user, token } = response.data;
      
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user));
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       setUser(user);
      
//       return response.data;
//     } catch (error) {
//       console.error('Signup error:', error);
//       throw error;
//     }
//   };

//   // GitHub Login
//   const GitHubLogin = () => {
//     window.location.href = `${API_URL}/github`;
//   };

//   // Logout function
//   const logout = async () => {
//     try {
//       await axios.post(`${API_URL}/logout`, {});
//     } catch (error) {
//       console.error('Logout API error:', error);
//     } finally {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       delete axios.defaults.headers.common['Authorization'];
//       setUser(null);
//       navigate('/sign-in');
//     }
//   };

//   // Check if user is GitHub user
//   const isGitHubUser = !!(user?.oauth_token || user?.github_id || user?.login);

//   const value = {
//     user,
//     login,
//     signup,
//     logout,
//     GitHubLogin,
//     loading,
//     isAuthenticated: !!user,
//     isGitHubUser
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };



// repo fixer


// context/AuthContext.jsx - COMPLETE WORKING VERSION with GitHub Token
import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const API_URL = 'http://localhost:3001/api/auth'

  // Configure axios defaults
  axios.defaults.withCredentials = true

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(parsedUser);
          console.log('✅ User restored:', parsedUser.username || parsedUser.login);
          console.log('🔑 GitHub Token present:', !!parsedUser.oauth_token);
        } catch (err) {
          console.error('Error parsing stored user:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    loadUser();

    // Listen for storage changes (for multiple tabs)
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (err) {
          console.error('Error parsing stored user on storage change:', err);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username: userData.name,
        email: userData.email,
        password: userData.password
      });
      
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // GitHub Login
  const GitHubLogin = () => {
    window.location.href = `${API_URL}/github`;
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {});
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      navigate('/sign-in');
    }
  };

  // ✅ CRITICAL: Get GitHub token from user object
  const githubToken = user?.oauth_token || user?.github_token || user?.github_access_token || null;
  
  // Check if user is GitHub user
  const isGitHubUser = !!(user?.oauth_token || user?.github_id || user?.login);

  // ✅ Add these to the value object
  const value = {
    user,
    login,
    signup,
    logout,
    GitHubLogin,
    loading,
    isAuthenticated: !!user,
    isGitHubUser,
    githubToken,  // ✅ THIS IS WHAT REPOFIXER NEEDS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};