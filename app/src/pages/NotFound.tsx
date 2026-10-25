import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 text-center">
      <h1 className="text-primary text-3xl font-bold mb-2">404</h1>
      <p className="text-muted mb-4">Page not found</p>
      <Link to="/dashboard" className="text-primary font-semibold">Go home</Link>
    </div>
  )
}