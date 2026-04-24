import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Daftar from './Daftar'
import LupaPassword from './LupaPassword' // Import harus bersih tanpa tanda komentar
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/daftar" element={<Daftar />} />
        {/* TAMBAHKAN BARIS DI BAWAH INI */}
        <Route path="/lupa-password" element={<LupaPassword />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)