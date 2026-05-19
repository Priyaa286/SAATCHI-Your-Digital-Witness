import { useNavigate } from 'react-router-dom'

export default function IncidentCard({ incident }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/incident/${incident.id}`)}
      className="bg-gray-900 hover:bg-gray-800 cursor-pointer p-5 rounded-2xl flex justify-between items-center transition"
    >
      <div>
        <p className="font-semibold text-white">{incident.platform}</p>
        <p className="text-gray-400 text-sm truncate w-72">{incident.url}</p>
        <p className="text-gray-500 text-xs mt-1">{new Date(incident.timestamp).toLocaleString()}</p>
      </div>
      <div className="text-green-400 text-xs font-mono bg-gray-800 px-3 py-1 rounded-full">
        ✓ Verified
      </div>
    </div>
  )
}