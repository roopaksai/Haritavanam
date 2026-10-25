export default function AddTree() {
  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-primary text-xl font-semibold">Add a tree</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Photo</label>
        <div className="h-28 bg-[#E8E4D8] rounded-md flex items-center justify-center text-muted text-sm">Tap to capture / upload</div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Common / species name</label>
        <input className="w-full px-3 py-3 border border-border rounded-md bg-surface" placeholder="e.g. Neem" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description (optional)</label>
        <textarea className="w-full px-3 py-3 border border-border rounded-md bg-surface" rows={3} placeholder="Notes about this tree" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <div className="h-28 bg-[#C8D6C0] rounded-md flex items-center justify-center text-muted text-sm">Map — tap to set pin (manual fallback)</div>
      </div>
      <button className="w-full bg-primary text-white py-3 rounded-md font-semibold">Review & save</button>
    </div>
  )
}