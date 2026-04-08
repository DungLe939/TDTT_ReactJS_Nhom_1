import { Routes, Route } from 'react-router-dom'
import Navbar from './layouts/Navbar'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
  </>
  )
}

export default App
