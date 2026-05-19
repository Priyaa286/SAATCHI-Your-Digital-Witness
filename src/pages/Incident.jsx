import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import HashVerifier from '../components/HashVerifier'

export default function Incident() {
  const { id } = useParams()
  const [incident, setIncident] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', id)
        .single()
      setIncident(data)
    }
    fetch()
  }, [id])

  if (!incident) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      Loading...
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => navigate('/dashboard')} className="text-blue-400 hover:underline">
          ← Back to Vault
        </button>
        <h2 className="text-2xl font-bold">Incident Details</h2>

        <div className="bg-gray-900 rounded-2xl p-6 space-y-3">
          <p><span className="text-gray-400">Platform:</span> {incident.platform}</p>
          <p><span className="text-gray-400">URL:</span> {incident.url}</p>
          <p><span className="text-gray-400">Captured At:</span> {new Date(incident.timestamp).toLocaleString()}</p>
          <p><span className="text-gray-400">Sender:</span> {incident.sender_name || 'Unknown'}</p>
          <p><span className="text-gray-400">Description:</span> {incident.description || '—'}</p>
        </div>

        <HashVerifier hash={incident.sha256_hash} />

        {incident.screenshot_url && (
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-gray-400 mb-2">Screenshot:</p>
            <img src={incident.screenshot_url} alt="Evidence" className="rounded-lg w-full" />
          </div>
        )}

        <button
          onClick={() => navigate(`/report/${incident.id}`)}
          className="w-full bg-blue-600 p-3 rounded-xl font-semibold hover:bg-blue-700"
        >
          Generate Legal PDF Report
        </button>
      </div>
    </div>
  )
}