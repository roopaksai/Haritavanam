import { Link } from 'react-router-dom'

export default function PlantDetails() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-[#C8D6C0] h-44 rounded-lg flex items-center justify-center text-muted">Photo</div>
      <div>
        <h2 className="text-primary text-2xl font-bold">Neem</h2>
        <p className="text-muted text-sm">Azadirachta indica · Tree</p>
        <p className="text-muted text-sm">Planted 12 Mar 2026</p>
      </div>
      <div className="bg-surface rounded-lg p-4 shadow-sm space-y-1">
        <p><span className="font-semibold">Owner:</span> Sai Roopak</p>
        <p><span className="font-semibold">Monitor:</span> — (request to monitor)</p>
      </div>
      <div className="bg-surface rounded-lg p-4 shadow-sm space-y-2">
        <p className="font-semibold">Next watering</p>
        <p className="text-muted text-sm">Planned: Sat 25 Oct 2026</p>
        <button className="w-full bg-primary text-white py-2 rounded-md font-semibold">Mark watered</button>
      </div>
      <div className="bg-surface rounded-lg p-4 shadow-sm text-center space-y-2">
        <p className="font-semibold">QR code</p>
        <p className="text-muted text-xs">Scan to view public details</p>
        <div className="w-20 h-20 mx-auto border-2 border-primary rounded-md flex items-center justify-center text-muted text-xs">QR</div>
      </div>
      <Link to="/dashboard" className="block text-center text-primary text-sm">← Back</Link>
    </div>
  )
}