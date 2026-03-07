// components/SignIn.jsx
import React, { useState, useEffect } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Github,
  User,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

const SignIn = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const { login, signup, GitHubLogin, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Check for GitHub callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    
    if (token) {
      console.log('✅ GitHub callback detected');
      // AuthContext will handle this automatically
      navigate('/');
    }
    
    if (error) {
      setError(`GitHub login failed: ${error}`);
    }
  }, [navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Form submitted:', formData)

      if (isSignUp) {
        if (!formData.name.trim()) throw new Error('Please enter your name!')
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords don't match!")
        if (formData.password.length < 6) throw new Error('Password must be at least 6 characters!')
        
        await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
        navigate('/')
      } else {
        await login(formData.email, formData.password)
        navigate('/')
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError(err.response?.data?.error || err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGitHub = () => {
    setLoading(true);
    GitHubLogin();
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 relative overflow-hidden p-4'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-10 w-72 h-72 md:w-96 md:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'></div>
        <div className='absolute top-40 right-10 w-72 h-72 md:w-96 md:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse' style={{ animationDelay: '1s' }}></div>
        <div className='absolute bottom-20 left-1/3 w-72 h-72 md:w-96 md:h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse' style={{ animationDelay: '2s' }}></div>
      </div>

      <div className='w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl relative z-10 flex flex-col lg:flex-row'>
        {/* Left Side - Banner */}
        <div className='w-full lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden py-8 lg:py-0'>
          <div className='absolute inset-0 bg-black/20'></div>
          <div className='relative z-10 h-full min-h-80 lg:min-h-auto flex flex-col justify-center items-center text-white p-6 md:p-12'>
            <div className='mb-4 md:mb-8 animate-bounce-slow'>
              <Sparkles size={48} className='md:size-64 text-white drop-shadow-2xl' />
            </div>
            <h1 className='text-3xl md:text-5xl font-bold mb-2 md:mb-4 text-center drop-shadow-lg'>
              {isSignUp ? 'Join Us!' : 'Welcome Back!'}
            </h1>
            <p className='text-lg md:text-xl text-center text-white/90 drop-shadow-md px-4'>
              {isSignUp 
                ? 'Create an account to get started'
                : 'Enter your credentials to access your account'}
            </p>
            <div className='mt-6 md:mt-12 flex gap-4'>
              <div className='w-12 md:w-16 h-1 bg-white/50 rounded-full'></div>
              <div className='w-12 md:w-16 h-1 bg-white rounded-full'></div>
              <div className='w-12 md:w-16 h-1 bg-white/50 rounded-full'></div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className='w-full lg:w-1/2 bg-white/95 backdrop-blur-xl p-6 md:p-8 lg:p-12 flex flex-col justify-center'>
          <div className='mb-6 md:mb-8 animate-slideUp'>
            <h2 className='text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 md:mb-2'>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className='text-sm md:text-base text-gray-600'>
              {isSignUp
                ? 'Fill in your details to get started'
                : 'Enter your details to continue'}
            </p>
          </div>

          {error && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-slideInLeft'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4 md:space-y-6'>
            {isSignUp && (
              <div className='group animate-slideInLeft' style={{animationDelay: '0.1s'}}>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                  Full Name
                </label>
                <div className='relative'>
                  <User className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition' size={20} />
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='John Doe'
                    className='w-full pl-12 pr-4 py-2 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition'
                    required={isSignUp}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className='group animate-slideInLeft' style={{animationDelay: '0.2s'}}>
              <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition' size={20} />
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='you@example.com'
                  className='w-full pl-12 pr-4 py-2 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition'
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className='group animate-slideInLeft' style={{animationDelay: '0.3s'}}>
              <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition' size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='••••••••'
                  className='w-full pl-12 pr-12 py-2 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition'
                  required
                  disabled={loading}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition'
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className='group animate-slideInLeft' style={{animationDelay: '0.4s'}}>
                <label className='block text-xs md:text-sm font-semibold text-gray-700 mb-2'>
                  Confirm Password
                </label>
                <div className='relative'>
                  <Lock className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition' size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder='••••••••'
                    className='w-full pl-12 pr-12 py-2 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition'
                    required={isSignUp}
                    disabled={loading}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition'
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 md:py-3 text-sm md:text-base rounded-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 animate-slideInLeft disabled:opacity-70 disabled:cursor-not-allowed'
              style={{animationDelay: '0.5s'}}
            >
              {loading ? (
                <>
                  <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className='relative mt-4 md:mt-6 animate-slideInLeft' style={{animationDelay: '0.6s'}}>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300'></div>
            </div>
            <div className='relative flex justify-center text-xs md:text-sm'>
              <span className='px-4 bg-white text-gray-500'>
                Or continue with
              </span>
            </div>
          </div>

          <button
            type='button'
            onClick={handleGitHub}
            disabled={loading}
            className='flex items-center justify-center gap-2 py-2 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition animate-slideInLeft disabled:opacity-70 disabled:cursor-not-allowed mt-4'
            style={{animationDelay: '0.7s'}}
          >
            <Github size={20} />
            <span className='font-semibold text-gray-700'>
              {loading ? 'Redirecting...' : 'GitHub'}
            </span>
          </button>

          <p className='mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-600 animate-slideInLeft' style={{animationDelay: '0.8s'}}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type='button'
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: ''
                })
              }}
              className='text-purple-600 hover:text-purple-700 font-semibold cursor-pointer'
              disabled={loading}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-slideInLeft { animation: slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  )
}

export default SignIn