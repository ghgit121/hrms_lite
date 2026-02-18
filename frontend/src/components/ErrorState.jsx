import { AlertTriangle } from 'lucide-react'

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="error-state">
      <AlertTriangle size={48} />
      <h3>Error</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}
