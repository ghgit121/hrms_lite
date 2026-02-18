import { useState } from 'react'

export default function ConfirmDialog({ title, message, onConfirm, onCancel, danger = false }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--color-gray-600)', fontSize: 14, marginBottom: 24 }}>{message}</p>
          <div className="form-actions">
            <button className="btn btn-outline" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button
              className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleConfirm}
              disabled={loading}
              style={danger ? { background: 'var(--color-danger)', color: 'white', border: 'none' } : {}}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
