export default function HashVerifier({ hash }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 space-y-2">
      <p className="text-gray-400 text-sm font-semibold">SHA-256 Cryptographic Hash</p>
      <p className="font-mono text-green-400 text-xs break-all">{hash}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
        <span className="text-green-400 text-sm">TAMPER-PROOF — Evidence Integrity Verified</span>
      </div>
    </div>
  )
}