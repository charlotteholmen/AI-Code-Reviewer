import React from 'react'
import {
  Code,
  Trophy,
  Bot,
  GitBranch,
  ArrowRight
} from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 relative overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-10 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'></div>
        <div
          className='absolute top-40 right-10 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className='absolute bottom-20 left-1/3 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative z-10 flex-grow p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center gap-8 md:gap-12">
        
        {/* Hero Section */}
        <div className="max-w-4xl w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-purple-300 font-bold mb-3 md:mb-4 drop-shadow-2xl animate-fade-in text-center">
            Your Personal AI Coding Coach
          </h1>

          <p className="text-base sm:text-lg md:text-xl font-bold text-purple-200 mb-4 md:mb-6 drop-shadow-lg text-center px-2">
            Compete in contests, write better code, and learn from AI-powered
            reviews. Think LeetCode + ChatGPT combined! 🚀
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-5 justify-center items-center sm:items-stretch px-2">
            <button className="w-full sm:w-auto bg-gradient-to-r from-purple-400 to-pink-400 text-purple-900 font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:from-purple-300 hover:to-pink-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg text-sm sm:text-base">
              <div className="flex justify-center items-center gap-2">
                <span>Start Competing</span>
                <ArrowRight size={18} className="sm:size-5" />
              </div>
            </button>

            <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md hover:bg-white/20 text-purple-100 font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg border border-purple-300/30 hover:border-purple-300/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg text-sm sm:text-base">
              <div className="flex justify-center items-center gap-2">
                <span>Try AI Review</span>
                <ArrowRight size={18} className="sm:size-5" />
              </div>
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8 w-full max-w-7xl px-2 sm:px-4">
          
          {/* Coding Contests Card */}
          <div className="w-full flex flex-col gap-3 md:gap-4 justify-start items-start border border-purple-400/30 p-4 md:p-6 rounded-xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-xl hover:from-purple-800/70 hover:to-indigo-800/70 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl group">
            <div className="p-2 md:p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Trophy size={28} className="md:size-8 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Coding Contests</h2>
            <p className="text-sm md:text-base lg:text-lg max-w-lg text-start leading-relaxed text-purple-100">
              Join programming competitions, solve challenges, and compete with
              coders worldwide on a live leaderboard.
            </p>
          </div>

          {/* AI Code Review Card */}
          <div className="w-full flex flex-col gap-3 md:gap-4 justify-start items-start border border-purple-400/30 p-4 md:p-6 rounded-xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-xl hover:from-purple-800/70 hover:to-indigo-800/70 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl group">
            <div className="p-2 md:p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Bot size={28} className="md:size-8 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">AI Code Review</h2>
            <p className="text-sm md:text-base lg:text-lg max-w-lg text-start leading-relaxed text-purple-100">
              Get instant AI-powered feedback, detailed analysis, MCP(Model Context Protocol) and
              personalized tips to improve your code quality.
            </p>
          </div>

          {/* Smart Editor Card */}
          <div className="w-full flex flex-col gap-3 md:gap-4 justify-start items-start border border-purple-400/30 p-4 md:p-6 rounded-xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-xl hover:from-purple-800/70 hover:to-indigo-800/70 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl group">
            <div className="p-2 md:p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Code size={28} className="md:size-8 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Smart Editor</h2>
            <p className="text-sm md:text-base lg:text-lg max-w-lg text-start leading-relaxed text-purple-100">
              Code in Python, Java, C++, or JavaScript with real-time execution
              powered by Judge0.
            </p>
          </div>

          {/* GitHub Integration Card */}
          <div className="w-full flex flex-col gap-3 md:gap-4 justify-start items-start border border-purple-400/30 p-4 md:p-6 rounded-xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-xl hover:from-purple-800/70 hover:to-indigo-800/70 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl group">
            <div className="p-2 md:p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              <GitBranch size={28} className="md:size-8 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">GitHub Integration</h2>
            <p className="text-sm md:text-base lg:text-lg max-w-lg text-start leading-relaxed text-purple-100">
              Save your solutions directly to GitHub and maintain your coding
              portfolio effortlessly.
            </p>
          </div>

        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Home;