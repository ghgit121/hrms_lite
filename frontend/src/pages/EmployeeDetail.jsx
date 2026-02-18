import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, UserCheck, UserX } from 'lucide-react'
import { getEmployee, getAttendance } from '../services/api'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [empRes, attRes] = await Promise.all([
        getEmployee(id),
        getAttendance({ employee_id: id }),
      ])
      setEmployee(empRes.data)
      setAttendance(attRes.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load employee details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  if (loading) return <LoadingState message="Loading employee details..." />
  if (error) return <ErrorState message={error} onRetry={fetchData} />
  if (!employee) return <ErrorState message="Employee not found" />

  return (
    <div>
      <span className="back-link" onClick={() => navigate('/employees')}>
        <ArrowLeft size={16} /> Back to Employees
      </span>

      <div className="page-header">
        <h2>{employee.full_name}</h2>
        <p>{employee.email} · {employee.department}</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon primary">
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>{employee.total_present + employee.total_absent}</h3>
            <p>Total Records</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>{employee.total_present}</h3>
            <p>Present Days</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger">
            <UserX size={24} />
          </div>
          <div className="stat-info">
            <h3>{employee.total_absent}</h3>
            <p>Absent Days</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Attendance History</h3>
        </div>
        {attendance.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            message="No attendance has been marked for this employee yet"
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((att) => (
                  <tr key={att.id}>
                    <td>{att.date}</td>
                    <td>
                      <span className={`badge ${att.status === 'Present' ? 'badge-present' : 'badge-absent'}`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
