'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, Github, Star, GitFork, Download, Code, ArrowLeft } from 'lucide-react'

export default function ProfilePage() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [repos, setRepos] = useState([])

  // Check authentication status
  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to home...')
      navigate('/')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (user?.repos) {
      const repoData = user.repos.map((name, index) => ({
        id: index,
        name,
        description: 'No description available',
        stars: Math.floor(Math.random() * 100),
        forks: Math.floor(Math.random() * 50),
        language: 'JavaScript' // You can make this dynamic if you have the data
      }))
      setRepos(repoData)
    }
  }, [user])

  // Enhanced logout handler
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Show nothing while checking auth (will redirect if no user)
  if (!user) {
    return null
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      {/* Header */}
      <div className='border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
          <div className='flex items-center gap-4'>
            <button
              onClick={handleBackToHome}
              className='flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-all duration-200 border border-slate-600'
            >
              <ArrowLeft className='w-4 h-4' />
              Back
            </button>
            <div className='flex items-center gap-2'>
              <Github className='w-6 h-6 text-blue-400' />
              <span className='text-white font-semibold'>GitHub Profile</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200 border border-red-500/30 text-sm sm:text-base'
          >
            <LogOut className='w-4 h-4 sm:w-5 sm:h-5' />
            Logout
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        <div className='bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl'>
          {/* Cover Background */}
          <div className='h-28 sm:h-32 md:h-36 bg-gradient-to-r from-blue-600 to-purple-600'></div>

          {/* Profile Content */}
          <div className='px-6 sm:px-8 pb-6 sm:pb-8'>
            {/* Avatar and User Info */}
            <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 -mt-16 relative z-10 mb-6 sm:mb-8 items-center sm:items-start'>
              <img
                src={user?.avatar_url || 'https://via.placeholder.com/150'}
                alt='User Avatar'
                className='w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-slate-800 bg-slate-700 shadow-lg'
              />
              <div className='flex-1 text-center sm:text-left pt-2 sm:pt-4'>
                <h1 className='text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-5'>
                  {user?.username || 'User'}
                </h1>
                <p className='text-slate-400 mb-2'>
                  @{user?.login || user?.username || 'username'}
                </p>
                <p className='text-slate-300 mb-2 sm:mb-4 text-sm sm:text-base'>
                  {user?.bio || 'No bio available'}
                </p>
                <div className='flex flex-col sm:flex-row justify-center sm:justify-start gap-2 text-xs sm:text-sm text-slate-400'>
                  {user?.location && <span>📍 {user.location}</span>}
                  {user?.blog && (
                    <span>
                      🔗{' '}
                      <a
                        href={user.blog}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-blue-300'
                      >
                        {user.blog}
                      </a>
                    </span>
                  )}
                  {user?.email && <span>✉️ {user.email}</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8 p-4 bg-slate-700/30 rounded-lg border border-slate-700/50 text-center'>
              <div>
                <p className='text-2xl sm:text-3xl font-bold text-blue-400'>
                  {user?.repos?.length || 0}
                </p>
                <p className='text-slate-400 text-sm sm:text-base'>
                  Repositories
                </p>
              </div>
              <div>
                <p className='text-2xl sm:text-3xl font-bold text-green-400'>
                  {user?.followers || 0}
                </p>
                <p className='text-slate-400 text-sm sm:text-base'>Followers</p>
              </div>
              <div>
                <p className='text-2xl sm:text-3xl font-bold text-purple-400'>
                  {user?.following || 0}
                </p>
                <p className='text-slate-400 text-sm sm:text-base'>Following</p>
              </div>
            </div>

            {/* Repositories Section */}
            <div>
              <h2 className='text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-2'>
                <Github className='w-5 sm:w-6 h-5 sm:h-6' />
                Recent Repositories ({repos.length})
              </h2>
              {repos.length > 0 ? (
                <div className='space-y-3 sm:space-y-4'>
                  {repos.map(repo => (
                    <div
                      key={repo.id}
                      className='p-3 sm:p-4 bg-slate-700/30 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-200'
                    >
                      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3 gap-2 sm:gap-0'>
                        <h3 className='text-base sm:text-lg font-semibold text-blue-300 hover:text-blue-200 break-all'>
                          {repo.name}
                        </h3>
                        <span className='px-2 py-1 bg-slate-600 text-slate-300 text-xs sm:text-sm rounded'>
                          {repo.language}
                        </span>
                      </div>
                      <p className='text-slate-400 text-xs sm:text-sm mb-2'>
                        {repo.description}
                      </p>
                      <div className='flex flex-wrap gap-2 sm:gap-4 text-slate-400 text-xs sm:text-sm'>
                        <span className='flex items-center gap-1'>
                          <Star className='w-3 sm:w-4 h-3 sm:h-4' /> {repo.stars}
                        </span>
                        <span className='flex items-center gap-1'>
                          <GitFork className='w-3 sm:w-4 h-3 sm:h-4' /> {repo.forks}
                        </span>
                        {/* Download button */}
                        <a
                          href={`https://github.com/${user.login}/${repo.name}/archive/refs/heads/main.zip`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 rounded'
                        >
                          <Download className='w-3 h-3 sm:w-4 sm:h-4' />
                          Download
                        </a>
                        {/* View Code button */}
                        <a
                          href={`https://github.com/${user.login}/${repo.name}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/40 text-green-200 rounded'
                        >
                          <Code className='w-3 h-3 sm:w-4 sm:h-4' />
                          View Code
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No repositories found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}   