import { Link } from 'react-router-dom'

const records = [
  { id: '1', name: 'Neem', species: 'Azadirachta indica', planted: '12 Mar 2026', distance: '2.3 km', status: 'Healthy', statusClass: 'bg-green-100 text-green-800' },
  { id: '2', name: 'Mango', species: 'Mangifera indica', planted: '04 Jan 2026', distance: '5.1 km', status: 'Under care', statusClass: 'bg-yellow-100 text-yellow-800' },
]

export default function Dashboard() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-[#C8D6C0] h-64 rounded-lg relative overflow-hidden">
        <div className="absolute top-12 left-16 w-6 h-6 rounded-full bg-accent border-2 border-white" />
        <div className="absolute top-28 left-44 w-6 h-6 rounded-full bg-secondary border-2 border-white" />
        <div className="absolute top-44 left-28 w-6 h-6 rounded-full bg-accent border-2 border-white" />
      </div>
      {records.map((r) => (
        <Link key={r.id} to={`/plants/${r.id}`} className="block bg-surface rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{r.name} — {r.species}</p>
              <p className="text-muted text-xs">Planted {r.planted} · {r.distance} away</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.statusClass}`}>{r.status}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}