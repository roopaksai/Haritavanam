import { Link } from 'react-router-dom'

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
      <p className="text-secondary font-semibold tracking-widest text-xs mb-2">PLANT · TRACK · PRESERVE</p>
      <h1 className="text-primary text-3xl font-bold mb-2">A Greener Tomorrow</h1>
      <p className="text-muted mb-8 max-w-xs">Plant trees, track their growth and be a part of a sustainable future.</p>
      <Link to="/signin" className="w-full max-w-xs bg-primary text-white py-3 rounded-md font-semibold text-center block mb-3">Get started</Link>
      <Link to="/signin" className="w-full max-w-xs border border-primary text-primary py-3 rounded-md font-semibold text-center block">Sign in</Link>
    </div>
  )
}