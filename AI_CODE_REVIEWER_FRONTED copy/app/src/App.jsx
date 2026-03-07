// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Home from './components/Home.jsx'
import Contest from './components/Contest.jsx'
import SignIn from './components/SignIn.jsx'
import Profile from './components/Profile.jsx'
import Editor from './components/Code_Editor.jsx'
import AIReviewPage from './components/AIReviewPage.jsx'
import RepoFixer from './components/RepoFixer.jsx'
import CodeGenerator from './components/CodeGenerator.jsx' // ✅ Direct import from components
import AuthCallback from './components/AuthCallback.jsx'
import ChatInterface from './components/ChatInterface.jsx'

// Providers
import { AuthProvider } from './context/AuthContext.jsx'
import { CodeEditorProvider } from './context/CodeEditorContext.jsx'
import { AIReviewProvider } from './context/AIReviewContext.jsx'
import { CodeGenProvider } from './context/CodeGenContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx' // ✅ Import ChatProvider

console.log('✅ App.jsx loaded')

const App = () => {
  console.log('🔄 App rendering')

  return (
    <BrowserRouter>
      <AuthProvider>
        <CodeEditorProvider>
          <AIReviewProvider>
            <CodeGenProvider>
              <ChatProvider>
                {' '}
                {/* ✅ Wrap with ChatProvider */}
                <Routes>
                  <Route element={<Layout />}>
                    <Route path='/' element={<Home />} />
                    <Route path='/contest' element={<Contest />} />
                    <Route path='/sign-in' element={<SignIn />} />
                    <Route path='/profile/:username' element={<Profile />} />
                    <Route path='/editor' element={<Editor />} />
                    <Route path='/ai-review' element={<AIReviewPage />} />
                    <Route path='/repo-fixer' element={<RepoFixer />} />
                    <Route
                      path='/code-generator'
                      element={<CodeGenerator />}
                    />{' '}
                    {/* ✅ Direct component */}
                  </Route>
                  <Route path='/chat' element={<ChatInterface />} />
                  <Route path='/auth/callback' element={<AuthCallback />} />
                </Routes>
              </ChatProvider>
            </CodeGenProvider>
          </AIReviewProvider>
        </CodeEditorProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
