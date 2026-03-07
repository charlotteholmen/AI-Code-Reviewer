// src/components/Footer.jsx
import React from 'react'
import {
  Code,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Heart,
  Sparkles,
  Shield,
  Zap,
  Globe,
  BookOpen,
  MessageCircle,
  Award,
  Rocket,
  ChevronUp,
  Send  // 👈 ADD THIS LINE (was missing!)
} from 'lucide-react'

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className='relative bg-gradient-to-br from-[rgb(15,17,40)] via-[rgb(20,22,50)] to-[rgb(25,27,60)] text-white border-t border-purple-500/20 shadow-2xl'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 left-10 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-0 right-10 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className='absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group'
        aria-label='Scroll to top'
      >
        <ChevronUp size={20} className='group-hover:animate-bounce' />
      </button>

      {/* Main Footer Content */}
      <div className='max-w-7xl mx-auto px-6 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
          
          {/* Brand Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-3 group'>
              <div className='p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl transform group-hover:scale-110 transition-all duration-300'>
                <Code size={28} className='text-white' />
              </div>
              <div>
                <h2 className='text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>
                  AI Code Reviewer
                </h2>
                <p className='text-xs text-gray-400'>v2.0.0</p>
              </div>
            </div>
            
            <p className='text-gray-300 text-sm leading-relaxed'>
              Where every coder gets their own AI coach! Experience the future of code review with our hybrid AI system combining Cerebras and Groq.
            </p>
            
            {/* Stats Badges */}
            <div className='flex items-center gap-3 flex-wrap'>
              <div className='flex items-center gap-1 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/30'>
                <Sparkles size={14} className='text-purple-400' />
                <span className='text-xs text-gray-300'>10K+ Reviews</span>
              </div>
              <div className='flex items-center gap-1 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/30'>
                <Zap size={14} className='text-blue-400' />
                <span className='text-xs text-gray-300'>99.9% Uptime</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'>
              Quick Links
            </h3>
            <ul className='space-y-3'>
              {[
                { name: 'Home', icon: <Globe size={16} />, path: '/' },
                { name: 'Editor', icon: <Code size={16} />, path: '/editor' },
                { name: 'AI Review', icon: <Sparkles size={16} />, path: '/ai-review' },
                { name: 'Repo Fixer', icon: <Zap size={16} />, path: '/repo-fixer' },
                { name: 'Contest', icon: <Award size={16} />, path: '/contest' }
              ].map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.path}
                    className='flex items-center gap-3 text-gray-300 hover:text-white group transition-colors'
                  >
                    <span className='text-purple-400 group-hover:scale-110 transition-transform'>
                      {link.icon}
                    </span>
                    <span className='text-sm'>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400'>
              Resources
            </h3>
            <ul className='space-y-3'>
              {[
                { name: 'Documentation', icon: <BookOpen size={16} />, href: '#' },
                { name: 'API Reference', icon: <Code size={16} />, href: '#' },
                { name: 'Community', icon: <MessageCircle size={16} />, href: '#' },
                { name: 'Support', icon: <Mail size={16} />, href: '#' },
                { name: 'Changelog', icon: <Rocket size={16} />, href: '#' }
              ].map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className='flex items-center gap-3 text-gray-300 hover:text-white group transition-colors'
                  >
                    <span className='text-blue-400 group-hover:scale-110 transition-transform'>
                      {link.icon}
                    </span>
                    <span className='text-sm'>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect & Newsletter */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400'>
              Connect With Us
            </h3>
            
            {/* Social Links */}
            <div className='flex items-center gap-3'>
              {[
                { icon: <Github size={18} />, href: 'https://github.com', label: 'GitHub' },
                { icon: <Twitter size={18} />, href: 'https://twitter.com', label: 'Twitter' },
                { icon: <Linkedin size={18} />, href: 'https://linkedin.com', label: 'LinkedIn' },
                { icon: <Mail size={18} />, href: 'mailto:support@aicodereviewer.com', label: 'Email' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='p-2 bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-all hover:scale-110 group'
                  aria-label={social.label}
                >
                  <span className='text-gray-400 group-hover:text-white'>{social.icon}</span>
                </a>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className='mt-4'>
              <p className='text-sm text-gray-300 mb-2'>Get updates & news</p>
              <div className='flex gap-2'>
                <input
                  type='email'
                  placeholder='Your email'
                  className='flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
                <button className='px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all hover:scale-105'>
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* Trust Badge */}
            <div className='flex items-center gap-2 mt-4 p-2 bg-gray-900/30 rounded-lg border border-gray-800'>
              <Shield size={16} className='text-green-400' />
              <span className='text-xs text-gray-400'>Enterprise-grade security</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className='relative my-8'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-800'></div>
          </div>
          <div className='relative flex justify-center'>
            <span className='px-4 bg-[rgb(20,22,50)] text-sm text-gray-400'>
              <Heart size={14} className='inline-block text-red-500 mx-1 animate-pulse' />
              Made with love for developers
              <Heart size={14} className='inline-block text-red-500 mx-1 animate-pulse' />
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400'>
          <div className='flex items-center gap-4'>
            <span>© {currentYear} AI Code Reviewer. All rights reserved.</span>
            <span className='hidden md:inline w-1 h-1 bg-gray-600 rounded-full'></span>
            <span>v2.0.0</span>
          </div>
          
          <div className='flex items-center gap-6'>
            <a href='#' className='hover:text-white transition'>Privacy</a>
            <a href='#' className='hover:text-white transition'>Terms</a>
            <a href='#' className='hover:text-white transition'>Cookies</a>
            
            {/* Tech Stack Badges */}
            <div className='hidden md:flex items-center gap-2 ml-4'>
              <span className='px-2 py-1 bg-gray-800/50 rounded text-xs text-gray-300 border border-gray-700'>
                Cerebras
              </span>
              <span className='px-2 py-1 bg-gray-800/50 rounded text-xs text-gray-300 border border-gray-700'>
                Groq
              </span>
              <span className='px-2 py-1 bg-gray-800/50 rounded text-xs text-gray-300 border border-gray-700'>
                MCP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats (optional) */}
      <div className='hidden lg:block absolute bottom-20 left-10 opacity-20'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
            <span className='text-xs'>AI: Online</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
            <span className='text-xs'>MCP: Active</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer