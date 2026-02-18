import { useState, useEffect } from 'react'
import { Plus, CalendarCheck, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAttendance, getEmployees, markAttendance } from '../services/api'
import Modal from '../components/Modal'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'

export default function Attendance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showMarkModal, setShowMarkModal] = useState(false)
  const [filters, setFilters] = useState({
    employee_id: '',
    date_from: '',
    date_to: '',
  })

  const fetchAttendance = async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      // Clean empty params
      const cleanParams = {}
      Object.entries(params).forEach(([key, value]) => {
        if (value) cleanParams[key] = value
      })
      const res = await getAttendance(cleanParams)
      setRecords(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  const handleFilter = () => {
    fetchAttendance(filters)
  }

  const handleClearFilters = () => {
    setFilters({ employee_id: '', date_from: '', date_to: '' })
    fetchAttendance()
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Attendance</h2>
          <p>Track and manage daily attendance records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowMarkModal(true)}>
          <Plus size={16} /> Mark Attendance
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div className="filter-bar">
            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                placeholder="Filter by ID"
                value={filters.employee_id}
                onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>From Date</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleFilter}>
              <Filter size={14} /> Apply
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading attendance records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchAttendance(filters)} />
      ) : records.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            message="Mark attendance for employees to see records here"
          />
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 500 }}>{rec.employee_id}</td>
                    <td>{rec.employee_name || '—'}</td>
                    <td>{rec.date}</td>
                    <td>
                      <span className={`badge ${rec.status === 'Present' ? 'badge-present' : 'badge-absent'}`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showMarkModal && (
        <MarkAttendanceModal
          onClose={() => setShowMarkModal(false)}
          onSuccess={() => {
            setShowMarkModal(false)
            fetchAttendance(filters)
          }}
        />
      )}
    </div>
  )
}

function MarkAttendanceModal({ onClose, onSuccess }) {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingEmployees, setLoadingEmployees] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getEmployees()
        setEmployees(res.data)
        if (res.data.length > 0) {
          setForm((prev) => ({ ...prev, employee_id: res.data[0].employee_id }))
        }
      } catch {
        toast.error('Failed to load employees')
      } finally {
        setLoadingEmployees(false)
      }
    }
    fetch()
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.employee_id) errs.employee_id = 'Please select an employee'
    if (!form.date) errs.date = 'Date is required'
    if (!form.status) errs.status = 'Status is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await markAttendance(form)
      toast.success('Attendance marked successfully')
      onSuccess()
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        toast.error(detail)
      } else if (Array.isArray(detail)) {
        toast.error(detail.map(d => d.msg).join(', '))
      } else {
        toast.error('Failed to mark attendance')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingEmployees) {
    return (
      <Modal title="Mark Attendance" onClose={onClose}>
        <LoadingState message="Loading employees..." />
      </Modal>
    )
  }

  if (employees.length === 0) {
    return (
      <Modal title="Mark Attendance" onClose={onClose}>
        <EmptyState title="No employees" message="Please add employees first before marking attendance" />
      </Modal>
    )
  }

  return (
    <Modal title="Mark Attendance" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Employee</label>
            <select
              value={form.employee_id}
              onChange={(e) => {
                setForm({ ...form, employee_id: e.target.value })
                if (errors.employee_id) setErrors({ ...errors, employee_id: '' })
              }}
              className={errors.employee_id ? 'error' : ''}
            >
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.employee_id} — {emp.full_name}
                </option>
              ))}
            </select>
            {errors.employee_id && <span className="form-error">{errors.employee_id}</span>}
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => {
                setForm({ ...form, date: e.target.value })
                if (errors.date) setErrors({ ...errors, date: '' })
              }}
              className={errors.date ? 'error' : ''}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Mark Attendance'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
