import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Placeholder auth: real implementation uses Supabase Auth when configured.
    if (!isSupabaseConfigured) {
      setError('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (see .env.example).')
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="px-6 py-8">
      <h2 className="text-primary text-2xl font-semibold mb-6">Sign in</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email or phone</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-3 border border-border rounded-md bg-surface" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-3 border border-border rounded-md bg-surface" placeholder="••••••••" />
        </div>
        {error && <p className="text-accent text-sm">{error}</p>}
        <button type="submit" className="w-full bg-primary text-white py-3 rounded-md font-semibold">Continue</button>
      </form>
      <p className="text-muted text-sm text-center mt-4">No account? Create one</p>
    </div>
  )
}