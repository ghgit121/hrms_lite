import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'No data found', message = '', icon: Icon = Inbox }) {
  return (
    <div className="empty-state">
      <Icon size={48} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  )
}
