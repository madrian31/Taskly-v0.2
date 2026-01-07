import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './pages/login/login';
import Home from './pages/home/home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename='/Taskly-v0.2'>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
