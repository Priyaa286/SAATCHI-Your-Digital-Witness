import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Incident from './pages/Incident'
import Report from './pages/Report'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/incident/:id" element={<Incident />} />
        <Route path="/report/:id" element={<Report />} />
      </Routes>
    </BrowserRouter>
  )
}