// Styles
import './index.css'

// React and React Router
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'

// Main App
import App from './App.jsx'

// Pages
import Login from './pages/login/login'
import Home from './pages/home/home'
import Task from './pages/task/task'

// Layout Components
import Layout from './components/layout'
import MainLayout from './components/main-layout/main-layout'
import RequireAuth from './auth/RequireAuth'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route element = {<Layout/>}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route path="/home" element={<Home />} />
          <Route path="/task" element={<Task />} />
        </Route>
        
      </Routes>
    </HashRouter>
  </StrictMode>
)