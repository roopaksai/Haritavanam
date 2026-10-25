export default function QRScan() {
  return (
    <div className="px-4 py-8 flex flex-col items-center space-y-4">
      <h2 className="text-primary text-xl font-semibold">Scan QR code</h2>
      <div className="w-60 h-60 border-[3px] border-primary rounded-md bg-surface flex items-center justify-center text-muted text-sm relative">
        <span className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-accent rounded-tl-md" />
        <span className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-accent rounded-br-md" />
        Align QR within frame
      </div>
      <p className="text-muted text-sm text-center">Camera permission required. Enter code manually if unavailable.</p>
      <button className="w-full max-w-xs border border-primary text-primary py-3 rounded-md font-semibold">Enter code manually</button>
    </div>
  )
}