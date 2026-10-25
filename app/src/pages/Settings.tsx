export default function Settings() {
  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-primary text-xl font-semibold">Settings</h2>
      <div className="bg-surface rounded-lg p-4 shadow-sm space-y-3">
        <p className="font-semibold">Profile</p>
        <p className="text-muted text-sm">Name, phone, email (controlled)</p>
      </div>
      <div className="bg-surface rounded-lg p-4 shadow-sm space-y-3">
        <p className="font-semibold">Privacy & permissions</p>
        <p className="text-muted text-sm">Location, camera guidance</p>
      </div>
      <button className="w-full border border-accent text-accent py-3 rounded-md font-semibold">Sign out</button>
    </div>
  )
}