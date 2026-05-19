// Wrapper component — can be used for filtered views later
import IncidentCard from './IncidentCard'

export default function EvidenceVault({ incidents }) {
  return (
    <div className="space-y-4">
      {incidents.map(incident => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  )
}