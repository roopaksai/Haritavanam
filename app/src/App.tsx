import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import { FullScreenLoader, RequireAdmin, RequireAuth } from './components/RequireAuth'
import { SplashScreen } from './components/brand'
import { PWAUpdateNotifier } from './components/PWAUpdateNotifier'
import { useAuth } from './lib/auth'
import Welcome from './pages/Welcome'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import PlantsPage from './pages/PlantsPage'
import MapPage from './pages/MapPage'
import PlantDetails from './pages/PlantDetails'
import AddPlant from './pages/AddPlant'
import QRPage from './pages/QRPage'
import Tickets from './pages/Tickets'
import TicketDetail from './pages/TicketDetail'
import Admin from './pages/Admin'
import Settings from './pages/Settings'
import About from './pages/About'
import Feedback from './pages/Feedback'
import PublicPlant from './pages/PublicPlant'
import NotFound from './pages/NotFound'

function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <FullScreenLoader />
      </div>
    )
  }

  return <Navigate to={user ? '/dashboard' : '/welcome'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <SplashScreen />
      <PWAUpdateNotifier />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/about" element={<About />} />
        <Route path="/p/:token" element={<PublicPlant />} />

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plants" element={<PlantsPage />} />
          <Route path="/plants/:id" element={<PlantDetails />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/add" element={<AddPlant />} />
          <Route path="/qr" element={<QRPage />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
