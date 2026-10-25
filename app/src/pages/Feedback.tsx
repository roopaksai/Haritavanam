export default function Feedback() {
  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-primary text-xl font-semibold">Feedback</h2>
      <div className="bg-surface rounded-lg p-4 shadow-sm space-y-3">
        <label className="block text-sm font-medium">Rating</label>
        <div className="flex gap-2 text-2xl text-secondary">★ ★ ★ ★ ☆</div>
        <label className="block text-sm font-medium">Message (optional)</label>
        <textarea className="w-full px-3 py-3 border border-border rounded-md bg-surface" rows={4} placeholder="Your feedback" />
        <button className="w-full bg-primary text-white py-3 rounded-md font-semibold">Submit</button>
      </div>
    </div>
  )
}