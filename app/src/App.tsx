import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Welcome from './pages/Welcome'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import PlantDetails from './pages/PlantDetails'
import AddTree from './pages/AddTree'
import QRScan from './pages/QRScan'
import Settings from './pages/Settings'
import About from './pages/About'
import Feedback from './pages/Feedback'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/signin" element={<SignIn />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plants/:id" element={<PlantDetails />} />
          <Route path="/add" element={<AddTree />} />
          <Route path="/qr" element={<QRScan />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/feedback" element={<Feedback />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}