// import React, { useContext } from 'react'
// import Editor from '@monaco-editor/react'
// import { Github, SaveIcon, Loader2, Wifi, RefreshCw, Play, Key } from 'lucide-react'
// import { CodeEditorContext } from '../context/CodeEditorContext.jsx'
// import { useNavigate } from 'react-router-dom'

// const CodeEditor = () => {
//   const { 
//     code, setCode, language, setLanguage, runCode, output, 
//     isLoading, editorStatus, getResultFromDB, testWebSocketConnection,
//     testAuthConnection, userToken
//   } = useContext(CodeEditorContext)
  
//   const navigate = useNavigate()

//   const handleCopy = () => {
//     if (code) {
//       navigator.clipboard.writeText(code)
//       alert('Code copied!')
//     } else {
//       alert('Nothing to copy')
//     }
//   }

//   const handleAIRreview = () => {
//     navigate('/ai-review')
//   }

//   const getStatusColor = () => {
//     switch(editorStatus) {
//       case 'executing':
//       case 'waiting':
//         return 'text-yellow-500'
//       case 'completed':
//         return 'text-green-500'
//       case 'error':
//       case 'timeout':
//         return 'text-red-500'
//       default:
//         return 'text-gray-500'
//     }
//   }

//   const getStatusText = () => {
//     switch(editorStatus) {
//       case 'ready': return 'Ready'
//       case 'executing': return 'Executing...'
//       case 'waiting': return 'Waiting for result...'
//       case 'completed': return 'Completed'
//       case 'error': return 'Error'
//       case 'timeout': return 'Timeout'
//       case 'testing': return 'Testing...'
//       case 'checking': return 'Checking...'
//       case 'no_result': return 'No result'
//       default: return editorStatus
//     }
//   }

//   return (
//     <div className='w-full h-full flex flex-col p-4 gap-4'>
      
//       {/* Connection Status */}
//       <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-2">
//             <Wifi size={20} className="text-green-500" />
//             <span className="text-sm font-medium text-white">
//               Editor Service: Connected
//             </span>
//           </div>
//           <span className={`text-sm font-medium ${getStatusColor()}`}>
//             Status: {getStatusText()}
//           </span>
//           {userToken && (
//             <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded">
//               Authenticated
//             </span>
//           )}
//         </div>

//         <div className="flex items-center gap-2">
//           <button 
//             onClick={testAuthConnection}
//             className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded text-sm hover:bg-purple-700 text-xs"
//             title="Test Authentication"
//           >
//             <Key size={12} />
//             Test Auth
//           </button>

//           <button 
//             onClick={testWebSocketConnection}
//             className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 text-xs"
//           >
//             <RefreshCw size={12} />
//             Test Connection
//           </button>

//           <button 
//             onClick={getResultFromDB}
//             className="bg-gray-600 text-white px-2 py-1 rounded text-sm hover:bg-gray-700 text-xs"
//           >
//             Check Result
//           </button>
//         </div>
//       </div>

//       {/* Buttons */}
//       <div className='flex gap-4 mt-4 justify-center items-center'>
//         <button
//           onClick={runCode}
//           disabled={isLoading}
//           className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
//             isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
//           } text-white`}
//         >
//           {isLoading ? (
//             <>
//               <Loader2 className="animate-spin" size={18} />
//               Running...
//             </>
//           ) : (
//             <>
//               <Play size={18} />
//               Compile & Run Code
//             </>
//           )}
//         </button>

//         <button 
//           onClick={handleAIRreview}
//           disabled={isLoading}
//           className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
//             isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:scale-105'
//           } text-white`}
//         >
//           <span className="text-lg">🤖</span>
//           AI Review
//         </button>
//       </div>

//       {/* Main Section */}
//       <div className='w-full h-full flex gap-4'>

//         {/* Editor */}
//         <div className='w-1/2 flex flex-col border border-slate-700 rounded-lg p-3 bg-[#1e293b]'>

//           <div className='flex justify-between items-center mb-3'>

//             <div className='bg-[#1d293d] text-white px-3 py-2 rounded-md'>
//               <select
//                 value={language}
//                 onChange={e => setLanguage(e.target.value)}
//                 className='bg-[#1d293d] outline-none text-white cursor-pointer'
//                 disabled={isLoading}
//               >
//                 <option value='javascript'>JavaScript</option>
//                 <option value='python'>Python</option>
//                 <option value='cpp'>C++</option>
//                 <option value='c'>C</option>
//                 <option value='java'>Java</option>
//                 <option value='typescript'>TypeScript</option>
//               </select>
//             </div>

//             <div className='flex gap-2'>

//               <button 
//                 className='relative group flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition'
//                 title="Push to GitHub (Coming Soon)"
//               >
//                 <Github size={16} />
//                 <span className='hidden md:inline'>GitHub</span>
//                 <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap'>
//                   Push Code With MCP
//                 </span>
//               </button>

//               <button 
//                 onClick={handleCopy}
//                 className='relative group flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition'
//                 title="Copy Code"
//               >
//                 <SaveIcon size={16} />
//                 <span className='hidden md:inline'>Copy</span>
//                 <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap'>
//                   Copy Code to Clipboard
//                 </span>
//               </button>

//             </div>
//           </div>

//           {/* Monaco Editor */}
//           <div className='h-[calc(100vh-250px)] border border-slate-600 rounded-lg overflow-hidden'>
//             <Editor
//               height='100%'
//               value={code || ""}
//               onChange={(value) => setCode(value || "")}
//               language={language}
//               theme='vs-dark'
//               options={{
//                 fontSize: 16,
//                 minimap: { enabled: false },
//                 wordWrap: 'on',
//                 readOnly: isLoading,
//                 scrollBeyondLastLine: false,
//                 automaticLayout: true
//               }}
//             />
//           </div>
//         </div>

//         {/* Output */}
//         <div className='w-1/2 flex flex-col border border-slate-700 rounded-lg p-3 bg-[#1e293b]'>
//           <div className='mb-3'>
//             <h3 className='text-lg font-semibold text-white'>Output</h3>
//           </div>
          
//           <div className='bg-black rounded-lg p-4 text-green-400 font-mono text-sm overflow-auto h-[calc(100vh-250px)]'>
//             {isLoading ? (
//               <div className="flex items-center gap-3">
//                 <Loader2 className="animate-spin" size={18} />
//                 <div>
//                   <div className="text-white">Executing code...</div>
//                   <div className="text-gray-400 text-xs mt-1">This may take a few seconds</div>
//                 </div>
//               </div>
//             ) : output ? (
//               <pre className="whitespace-pre-wrap">{output}</pre>
//             ) : (
//               <div className="text-gray-500 italic">
//                 <div className="text-lg mb-2">No output yet</div>
//                 <div className="text-sm">Run your code to see the output here</div>
//                 <div className="text-xs mt-4 text-gray-600">
//                   Tip: Use the "Compile & Run Code" button above
//                 </div>
//               </div>
//             )}
//           </div>

//         </div>

//       </div>

//       {/* Footer Info */}
//       <div className="text-center text-gray-500 text-sm mt-4">
//         <div className="flex flex-wrap items-center justify-center gap-4">
//           <span>Editor Service: Port 3002</span>
//           <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
//           <span>Language: {language}</span>
//           <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
//           <span>Code Length: {code.length} characters</span>
//           <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
//           <span>Token: {userToken ? 'Present' : 'Missing'}</span>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CodeEditor




// code editor component with GitHub MCP integration


// src/components/Code_Editor.jsx
import React, { useContext } from 'react'
import Editor from '@monaco-editor/react'
import { 
  Github, 
  SaveIcon, 
  Loader2, 
  Wifi, 
  RefreshCw, 
  Play, 
  Key,
  GitBranch 
} from 'lucide-react'
import { CodeEditorContext } from '../context/CodeEditorContext.jsx'
import { useNavigate } from 'react-router-dom'
import GitHubMCPButton from '../components/GitHubMCP/GitHubMCPButton.jsx' // Import MCP button
// ./GitHubMCPButton
const CodeEditor = () => {
  const { 
    code, setCode, language, setLanguage, runCode, output, 
    isLoading, editorStatus, getResultFromDB, testWebSocketConnection,
    testAuthConnection, userToken
  } = useContext(CodeEditorContext)
  
  const navigate = useNavigate()

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      alert('Code copied!')
    } else {
      alert('Nothing to copy')
    }
  }

  const handleAIRreview = () => {
    navigate('/ai-review')
  }

  const getStatusColor = () => {
    switch(editorStatus) {
      case 'executing':
      case 'waiting':
        return 'text-yellow-500'
      case 'completed':
        return 'text-green-500'
      case 'error':
      case 'timeout':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusText = () => {
    switch(editorStatus) {
      case 'ready': return 'Ready'
      case 'executing': return 'Executing...'
      case 'waiting': return 'Waiting for result...'
      case 'completed': return 'Completed'
      case 'error': return 'Error'
      case 'timeout': return 'Timeout'
      case 'testing': return 'Testing...'
      case 'checking': return 'Checking...'
      case 'no_result': return 'No result'
      default: return editorStatus
    }
  }

  return (
    <div className='w-full h-full flex flex-col p-4 gap-4'>
      
      {/* Connection Status */}
      <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Wifi size={20} className="text-green-500" />
            <span className="text-sm font-medium text-white">
              Editor Service: Connected
            </span>
          </div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            Status: {getStatusText()}
          </span>
          {userToken && (
            <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded">
              Authenticated
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={testAuthConnection}
            className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded text-sm hover:bg-purple-700 text-xs"
            title="Test Authentication"
          >
            <Key size={12} />
            Test Auth
          </button>

          <button 
            onClick={testWebSocketConnection}
            className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 text-xs"
          >
            <RefreshCw size={12} />
            Test Connection
          </button>

          <button 
            onClick={getResultFromDB}
            className="bg-gray-600 text-white px-2 py-1 rounded text-sm hover:bg-gray-700 text-xs"
          >
            Check Result
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className='flex gap-4 mt-4 justify-center items-center'>
        <button
          onClick={runCode}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          } text-white`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Running...
            </>
          ) : (
            <>
              <Play size={18} />
              Compile & Run Code
            </>
          )}
        </button>

        <button 
          onClick={handleAIRreview}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:scale-105'
          } text-white`}
        >
          <span className="text-lg">🤖</span>
          AI Review
        </button>
      </div>

      {/* Main Section */}
      <div className='w-full h-full flex gap-4'>

        {/* Editor */}
        <div className='w-1/2 flex flex-col border border-slate-700 rounded-lg p-3 bg-[#1e293b]'>

          <div className='flex justify-between items-center mb-3'>

            <div className='bg-[#1d293d] text-white px-3 py-2 rounded-md'>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className='bg-[#1d293d] outline-none text-white cursor-pointer'
                disabled={isLoading}
              >
                <option value='javascript'>JavaScript</option>
                <option value='python'>Python</option>
                <option value='cpp'>C++</option>
                <option value='c'>C</option>
                <option value='java'>Java</option>
                <option value='typescript'>TypeScript</option>
              </select>
            </div>

            <div className='flex gap-2'>
              {/* 🚀 MCP GITHUB PUSH BUTTON - Only shows for GitHub users */}
              <GitHubMCPButton code={code} language={language} />

              {/* Copy Button */}
              <button 
                onClick={handleCopy}
                className='relative group flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition'
                title="Copy Code"
              >
                <SaveIcon size={16} />
                <span className='hidden md:inline'>Copy</span>
                <span className='absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap'>
                  Copy Code to Clipboard
                </span>
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className='h-[calc(100vh-250px)] border border-slate-600 rounded-lg overflow-hidden'>
            <Editor
              height='100%'
              value={code || ""}
              onChange={(value) => setCode(value || "")}
              language={language}
              theme='vs-dark'
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                wordWrap: 'on',
                readOnly: isLoading,
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>
        </div>

        {/* Output */}
        <div className='w-1/2 flex flex-col border border-slate-700 rounded-lg p-3 bg-[#1e293b]'>
          <div className='mb-3 flex justify-between items-center'>
            <h3 className='text-lg font-semibold text-white'>Output</h3>
            {output && (
              <button 
                onClick={() => navigator.clipboard.writeText(output)}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white transition"
              >
                Copy Output
              </button>
            )}
          </div>
          
          <div className='bg-black rounded-lg p-4 text-green-400 font-mono text-sm overflow-auto h-[calc(100vh-250px)]'>
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin" size={18} />
                <div>
                  <div className="text-white">Executing code...</div>
                  <div className="text-gray-400 text-xs mt-1">This may take a few seconds</div>
                </div>
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="text-gray-500 italic">
                <div className="text-lg mb-2">No output yet</div>
                <div className="text-sm">Run your code to see the output here</div>
                <div className="text-xs mt-4 text-gray-600">
                  Tip: Use the "Compile & Run Code" button above
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Footer Info */}
      <div className="text-center text-gray-500 text-sm mt-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span>Editor Service: Port 3002</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
          <span>Language: {language}</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
          <span>Code Length: {code.length} characters</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
          <span>Token: {userToken ? 'Present' : 'Missing'}</span>
        </div>
      </div>
    </div>
  )
}

export default CodeEditor