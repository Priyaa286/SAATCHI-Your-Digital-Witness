import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import IncidentCard from '../components/IncidentCard'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [incidents, setIncidents] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/'); return }
    const { data } = await supabase
      .from('incidents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setIncidents(data || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">👁️ SAATCHI</h1>
            <p className="text-gray-400 text-sm">Your Evidence Vault</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {incidents.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl">No evidence captured yet.</p>
            <p className="text-sm mt-2">Use the SAATCHI browser extension to capture harassment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}