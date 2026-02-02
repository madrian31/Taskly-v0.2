// Styles
import './index.css'

// React and React Router
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'

// Main App
import App from './App.jsx'

// Pages (lazy-loaded)
const Login = lazy(() => import('./pages/login/login.tsx'))
const Home = lazy(() => import('./pages/home/home.jsx'))
const Task = lazy(() => import('./pages/task/task.tsx'))
const Users = lazy(() => import('./pages/users/users.tsx'))
const Dashboard = lazy(() => import('./pages/dashboard/dashboard.tsx'))
const AccessNotAvailable = lazy(() => import('./pages/accessNotAvailable/accessNotAvailable.jsx'))

// Layout Components (lazy-loaded)
const Layout = lazy(() => import('./components/layout.jsx'))
const MainLayout = lazy(() => import('./components/main-layout/main-layout.jsx'))
import RequireAuth from './auth/RequireAuth.tsx'
import RequireRole from './auth/RequireRole.tsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<App />} />

          <Route element={<Layout/>}>
            <Route path="/login" element={<Login />} />
            <Route path="/access-not-available" element={<AccessNotAvailable />} />
          </Route>

          <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/task" element={<Task />} />
            <Route path="/users" element={<RequireRole allowedRoles={["admin"]}><Users /></RequireRole>} />
          </Route>
          
        </Routes>
      </Suspense>
    </HashRouter>
  </StrictMode>
)