import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
  <>
    {/* phan hero section o giua man hinh */}
    <section id="center" className="flex flex-col items-center justify-center text-center p-8 min-h-screen">
      <div className="hero flex items-center justify-center gap-8 mb-8">
        <img src={heroImg} className="w-40 h-auto hover:scale-105 transition-transform" alt="Hero" />
        <img src={reactLogo} className="w-24 h-24 object-contain animate-[spin_10s_linear_infinite]" alt="React logo" />
        <img src={viteLogo} className="w-24 h-24 object-contain hover:scale-110 transition-transform" alt="Vite logo" />
      </div>

      <div className="mb-8">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Get started
        </h1>
        <p className="text-lg text-gray-600">
          Edit <code className="bg-gray-100 text-pink-500 font-mono px-2 py-1 rounded-md text-sm">src/App.tsx</code> and save to test <code className="bg-gray-100 text-pink-500 font-mono px-2 py-1 rounded-md text-sm">HMR</code>
        </p>
      </div>

      {/* nut dem counter */}
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg active:scale-95"
        onClick={() => setCount((count) => count + 1)}
      >
        Count is {count}
      </button>
    </section>

    {/* duong ke ngang phan cach */}
    <div className="h-px w-full max-w-4xl mx-auto bg-gray-200 my-8"></div>

    {/* phan next steps chia 2 cot tren man hinh lon */}
    <section id="next-steps" className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto p-6">
      <div id="docs" className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <svg className="w-8 h-8 text-blue-500 mb-4" role="presentation" aria-hidden="true">
          <use href="/icons.svg#documentation-icon"></use>
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Documentation</h2>
        <p className="text-gray-500 mb-6">Your questions, answered</p>
        <ul className="flex flex-col gap-3">
          <li>
            <a href="https://vite.dev/" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium transition-colors">
              <img className="w-6 h-6" src={viteLogo} alt="" />
              Explore Vite
            </a>
          </li>
          <li>
            <a href="https://react.dev/" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium transition-colors">
              <img className="w-6 h-6" src={reactLogo} alt="" />
              Learn more
            </a>
          </li>
        </ul>
      </div>

      <div id="social" className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <svg className="w-8 h-8 text-blue-500 mb-4" role="presentation" aria-hidden="true">
          <use href="/icons.svg#social-icon"></use>
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect with us</h2>
        <p className="text-gray-500 mb-6">Join the Vite community</p>
        <ul className="grid grid-cols-2 gap-3">
          <li>
            <a href="https://github.com/vitejs/vite" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium transition-colors">
              <svg className="w-5 h-5" role="presentation" aria-hidden="true">
                <use href="/icons.svg#github-icon"></use>
              </svg>
              GitHub
            </a>
          </li>
          <li>
            <a href="https://chat.vite.dev/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium transition-colors">
              <svg className="w-5 h-5 text-indigo-500" role="presentation" aria-hidden="true">
                <use href="/icons.svg#discord-icon"></use>
              </svg>
              Discord
            </a>
          </li>
          <li>
            <a href="https://x.com/vite_js" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium transition-colors">
              <svg className="w-5 h-5 text-black" role="presentation" aria-hidden="true">
                <use href="/icons.svg#x-icon"></use>
              </svg>
              X.com
            </a>
          </li>
          <li>
            <a href="https://bsky.app/profile/vite.dev" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium transition-colors">
              <svg className="w-5 h-5 text-blue-400" role="presentation" aria-hidden="true">
                <use href="/icons.svg#bluesky-icon"></use>
              </svg>
              Bluesky
            </a>
          </li>
        </ul>
      </div>
    </section>

    <div className="h-24 w-full" id="spacer"></div>
  </>
)
}

export default App
