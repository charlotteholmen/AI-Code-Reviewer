// // components/Header.jsx
// import React, { useState } from 'react'
// import { Code, Menu, X, Github, LogOut, User, ChevronDown, Bug } from 'lucide-react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext.jsx'

// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false)
//   const [showProfileMenu, setShowProfileMenu] = useState(false)

//   const { user, logout, isGitHubUser, GitHubLogin } = useAuth()
//   const navigate = useNavigate()

//   // ✅ ADDED Repo Fixer to tabs
//   const tabs = [
//     { name: 'Home', path: '/' },
//     { name: 'Contest', path: '/contest' },
//     { name: 'Editor', path: '/editor' },
//     { name: 'AI Review', path: '/ai-review' },
//     { name: 'Repo Fixer', path: '/repo-fixer', icon: <Bug size={16} /> }
//   ]

//   console.log('👤 Header User:', user)
//   console.log('📛 Header UserName:', user?.username || user?.login)
//   console.log('🔑 Is GitHub User:', isGitHubUser)

//   const handleNavClick = () => {
//     setIsMenuOpen(false)
//     setShowProfileMenu(false)
//   }

//   const handleLogout = async () => {
//     await logout()
//     navigate('/sign-in')
//     setIsMenuOpen(false)
//     setShowProfileMenu(false)
//   }

//   const handleGitHubLogin = () => {
//     GitHubLogin()
//   }

//   // Get display name
//   const displayName = user?.username || user?.login || 'User'
//   const avatarUrl = user?.avatar_url

//   return (
//     <header className='bg-[rgb(21,23,51)] text-white p-4 sticky top-0 z-50 shadow-lg'>
//       <div className='max-w-7xl mx-auto flex justify-between items-center'>
//         {/* Logo Section */}
//         <Link
//           to='/'
//           className='flex items-center gap-3 flex-shrink-0'
//           onClick={handleNavClick}
//         >
//           <div className='rounded-full p-2 flex items-center'>
//             <Code
//               className='inline-block bg-[rgb(209,72,211)] rounded-md p-1'
//               size={32}
//             />
//           </div>
//           <h1 className='text-xl md:text-2xl font-bold hidden sm:block'>
//             AI Code Reviewer
//           </h1>
//         </Link>

//         {/* Desktop Navigation */}
//         <nav className='hidden md:flex justify-center items-center space-x-1 lg:space-x-6'>
//           {tabs.map(tab => (
//             <Link
//               key={tab.name}
//               to={tab.path}
//               onClick={handleNavClick}
//               className={`px-2 lg:px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 text-sm lg:text-base flex items-center gap-1 ${
//                 tab.name === 'Repo Fixer' ? 'text-purple-400 hover:text-purple-300' : ''
//               }`}
//             >
//               {tab.icon && <span className="inline-block">{tab.icon}</span>}
//               <span className='whitespace-nowrap'>{tab.name}</span>
//             </Link>
//           ))}

//           {/* User Menu - Desktop */}
//           {!user ? (
//             <div className='flex items-center gap-2'>
//               <button
//                 onClick={handleGitHubLogin}
//                 className='flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md font-semibold transition-colors duration-200'
//               >
//                 <Github size={18} />
//                 <span>GitHub</span>
//               </button>
//               <Link to='/sign-in'>
//                 <button className='bg-[rgb(209,72,211)] hover:bg-[rgb(180,60,182)] px-4 py-2 rounded-md font-semibold transition-colors duration-200'>
//                   Sign In
//                 </button>
//               </Link>
//             </div>
//           ) : (
//             <div className='relative'>
//               <button
//                 onClick={() => setShowProfileMenu(!showProfileMenu)}
//                 className='flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-md transition-colors duration-200'
//               >
//                 {/* Avatar */}
//                 <div className='w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center overflow-hidden'>
//                   {avatarUrl ? (
//                     <img
//                       src={avatarUrl}
//                       alt={displayName}
//                       className='w-6 h-6 rounded-full object-cover'
//                     />
//                   ) : (
//                     <User size={14} className='text-white' />
//                   )}
//                 </div>
//                 <span className='text-sm font-medium'>{displayName}</span>
//                 {isGitHubUser && <Github size={14} className='text-gray-400' />}
//                 <ChevronDown
//                   size={16}
//                   className={`transition-transform ${
//                     showProfileMenu ? 'rotate-180' : ''
//                   }`}
//                 />
//               </button>

//               {/* Profile Dropdown */}
//               {showProfileMenu && (
//                 <div className='absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50'>
//                   <Link
//                     to={`/profile/${displayName}`}
//                     onClick={() => setShowProfileMenu(false)}
//                     className='flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition'
//                   >
//                     <User size={16} />
//                     Profile
//                   </Link>
//                   {isGitHubUser && (
//                     <a
//                       href={`https://github.com/${user?.login || displayName}`}
//                       target='_blank'
//                       rel='noopener noreferrer'
//                       className='flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition'
//                     >
//                       <Github size={16} />
//                       GitHub Profile
//                     </a>
//                   )}
//                   <button
//                     onClick={handleLogout}
//                     className='flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full text-left transition'
//                   >
//                     <LogOut size={16} />
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </nav>

//         {/* Mobile Menu Button */}
//         <button
//           onClick={() => setIsMenuOpen(!isMenuOpen)}
//           className='md:hidden p-2 hover:bg-[rgb(209,72,211)] rounded-md transition-colors duration-200'
//         >
//           {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       </div>

//       {/* Mobile Navigation */}
//       {isMenuOpen && (
//         <nav className='md:hidden mt-4 pt-4 border-t border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200'>
//           <div className='flex flex-col space-y-2'>
//             {tabs.map(tab => (
//               <Link
//                 key={tab.name}
//                 to={tab.path}
//                 onClick={handleNavClick}
//                 className={`px-4 py-3 text-gray-300 hover:text-white hover:bg-[rgb(209,72,211)]/20 transition-colors duration-200 rounded-md text-base flex items-center gap-2 ${
//                   tab.name === 'Repo Fixer' ? 'text-purple-400' : ''
//                 }`}
//               >
//                 {tab.icon && <span className="inline-block">{tab.icon}</span>}
//                 {tab.name}
//               </Link>
//             ))}

//             {/* Mobile User Menu */}
//             {!user ? (
//               <>
//                 <button
//                   onClick={() => {
//                     handleGitHubLogin()
//                     setIsMenuOpen(false)
//                   }}
//                   className='flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-md font-semibold transition-colors duration-200 text-left'
//                 >
//                   <Github size={18} />
//                   Continue with GitHub
//                 </button>
//                 <Link to='/sign-in' onClick={handleNavClick}>
//                   <button className='w-full bg-[rgb(209,72,211)] hover:bg-[rgb(180,60,182)] px-4 py-3 rounded-md font-semibold transition-colors duration-200'>
//                     Sign In
//                   </button>
//                 </Link>
//               </>
//             ) : (
//               <>
//                 <Link
//                   to={`/profile/${displayName}`}
//                   onClick={handleNavClick}
//                   className='flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-md hover:bg-gray-700 transition'
//                 >
//                   <div className='w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center overflow-hidden'>
//                     {avatarUrl ? (
//                       <img
//                         src={avatarUrl}
//                         alt={displayName}
//                         className='w-8 h-8 rounded-full object-cover'
//                       />
//                     ) : (
//                       <User size={16} className='text-white' />
//                     )}
//                   </div>
//                   <div className='flex-1'>
//                     <p className='text-sm font-medium text-white'>
//                       {displayName}
//                     </p>
//                     <p className='text-xs text-gray-400'>
//                       {isGitHubUser ? 'GitHub User' : 'Local User'}
//                     </p>
//                   </div>
//                 </Link>
//                 <button
//                   onClick={handleLogout}
//                   className='flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition w-full text-left'
//                 >
//                   <LogOut size={18} />
//                   Logout
//                 </button>
//               </>
//             )}
//           </div>
//         </nav>
//       )}
//     </header>
//   )
// }

// export default Header







// components/Header.jsx
import React, { useState } from 'react'
import { 
  Code, Menu, X, Github, LogOut, User, ChevronDown, 
  Bug, MessageSquare, Bot, Sparkles 
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const { user, logout, isGitHubUser, GitHubLogin } = useAuth()
  const navigate = useNavigate()

  // ✅ UPDATED tabs with Chat route
  const tabs = [
    { name: 'Home', path: '/' },
    // { name: 'Contest', path: '/contest' },
    { name: 'Editor', path: '/editor' },
    { name: 'AI Review', path: '/ai-review' },
    { name: 'Repo Fixer', path: '/repo-fixer', icon: <Bug size={16} /> },
    { name: 'AI Chat', path: '/chat', icon: <MessageSquare size={16} /> }  // ✅ NEW CHAT ROUTE
  ]

  console.log('👤 Header User:', user)
  console.log('📛 Header UserName:', user?.username || user?.login)
  console.log('🔑 Is GitHub User:', isGitHubUser)

  const handleNavClick = () => {
    setIsMenuOpen(false)
    setShowProfileMenu(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/sign-in')
    setIsMenuOpen(false)
    setShowProfileMenu(false)
  }

  const handleGitHubLogin = () => {
    GitHubLogin()
  }

  // Get display name
  const displayName = user?.username || user?.login || 'User'
  const avatarUrl = user?.avatar_url

  return (
    <header className='bg-[rgb(21,23,51)] text-white p-4 sticky top-0 z-50 shadow-lg'>
      <div className='max-w-7xl mx-auto flex justify-between items-center'>
        {/* Logo Section */}
        <Link
          to='/'
          className='flex items-center gap-3 flex-shrink-0'
          onClick={handleNavClick}
        >
          <div className='rounded-full p-2 flex items-center'>
            <Code
              className='inline-block bg-[rgb(209,72,211)] rounded-md p-1'
              size={32}
            />
          </div>
          <h1 className='text-xl md:text-2xl font-bold hidden sm:block'>
            AI Code Reviewer
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex justify-center items-center space-x-1 lg:space-x-6'>
          {tabs.map(tab => (
            <Link
              key={tab.name}
              to={tab.path}
              onClick={handleNavClick}
              className={`px-2 lg:px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 text-sm lg:text-base flex items-center gap-1 ${
                tab.name === 'Repo Fixer' 
                  ? 'text-purple-400 hover:text-purple-300' 
                  : tab.name === 'AI Chat'
                  ? 'text-blue-400 hover:text-blue-300 font-medium'
                  : ''
              }`}
            >
              {tab.icon && <span className="inline-block">{tab.icon}</span>}
              <span className='whitespace-nowrap'>{tab.name}</span>
              {tab.name === 'AI Chat' && (
                <span className="ml-1 text-xs bg-blue-600/20 text-blue-300 px-1.5 py-0.5 rounded-full">
                  New
                </span>
              )}
            </Link>
          ))}

          {/* User Menu - Desktop */}
          {!user ? (
            <div className='flex items-center gap-2'>
              <button
                onClick={handleGitHubLogin}
                className='flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md font-semibold transition-colors duration-200'
              >
                <Github size={18} />
                <span>GitHub</span>
              </button>
              <Link to='/sign-in'>
                <button className='bg-[rgb(209,72,211)] hover:bg-[rgb(180,60,182)] px-4 py-2 rounded-md font-semibold transition-colors duration-200'>
                  Sign In
                </button>
              </Link>
            </div>
          ) : (
            <div className='relative'>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className='flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-md transition-colors duration-200'
              >
                {/* Avatar */}
                <div className='w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center overflow-hidden'>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className='w-6 h-6 rounded-full object-cover'
                    />
                  ) : (
                    <User size={14} className='text-white' />
                  )}
                </div>
                <span className='text-sm font-medium'>{displayName}</span>
                {isGitHubUser && <Github size={14} className='text-gray-400' />}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showProfileMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className='absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50'>
                  <Link
                    to={`/profile/${displayName}`}
                    onClick={() => setShowProfileMenu(false)}
                    className='flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition'
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  {isGitHubUser && (
                    <a
                      href={`https://github.com/${user?.login || displayName}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition'
                    >
                      <Github size={16} />
                      GitHub Profile
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className='flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full text-left transition'
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className='md:hidden p-2 hover:bg-[rgb(209,72,211)] rounded-md transition-colors duration-200'
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className='md:hidden mt-4 pt-4 border-t border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200'>
          <div className='flex flex-col space-y-2'>
            {tabs.map(tab => (
              <Link
                key={tab.name}
                to={tab.path}
                onClick={handleNavClick}
                className={`px-4 py-3 text-gray-300 hover:text-white hover:bg-[rgb(209,72,211)]/20 transition-colors duration-200 rounded-md text-base flex items-center gap-2 ${
                  tab.name === 'Repo Fixer' 
                    ? 'text-purple-400' 
                    : tab.name === 'AI Chat'
                    ? 'text-blue-400'
                    : ''
                }`}
              >
                {tab.icon && <span className="inline-block">{tab.icon}</span>}
                <span>{tab.name}</span>
                {tab.name === 'AI Chat' && (
                  <span className="ml-auto text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </Link>
            ))}

            {/* Mobile User Menu */}
            {!user ? (
              <>
                <button
                  onClick={() => {
                    handleGitHubLogin()
                    setIsMenuOpen(false)
                  }}
                  className='flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-md font-semibold transition-colors duration-200 text-left'
                >
                  <Github size={18} />
                  Continue with GitHub
                </button>
                <Link to='/sign-in' onClick={handleNavClick}>
                  <button className='w-full bg-[rgb(209,72,211)] hover:bg-[rgb(180,60,182)] px-4 py-3 rounded-md font-semibold transition-colors duration-200'>
                    Sign In
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={`/profile/${displayName}`}
                  onClick={handleNavClick}
                  className='flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-md hover:bg-gray-700 transition'
                >
                  <div className='w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center overflow-hidden'>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className='w-8 h-8 rounded-full object-cover'
                      />
                    ) : (
                      <User size={16} className='text-white' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-white'>
                      {displayName}
                    </p>
                    <p className='text-xs text-gray-400'>
                      {isGitHubUser ? 'GitHub User' : 'Local User'}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className='flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition w-full text-left'
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header