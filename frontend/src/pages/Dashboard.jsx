import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserCheck, UserX, Clock, TrendingUp } from 'lucide-react'
import { getDashboard, getEmployees, getAttendance } from '../services/api'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [employees, setEmployees] = useState([])
  const [recentAttendance, setRecentAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashRes, empRes, attRes] = await Promise.all([
        getDashboard(),
        getEmployees(),
        getAttendance(),
      ])
      setSummary(dashRes.data)
      setEmployees(empRes.data)
      setRecentAttendance(attRes.data.slice(0, 10))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <LoadingState message="Loading dashboard..." />
  if (error) return <ErrorState message={error} onRetry={fetchData} />

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome to HRMS Lite — your HR management overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{summary.total_employees}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>{summary.present_today}</h3>
            <p>Present Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger">
            <UserX size={24} />
          </div>
          <div className="stat-info">
            <h3>{summary.absent_today}</h3>
            <p>Absent Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{summary.not_marked_today}</h3>
            <p>Not Marked Today</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Employee Summary Table */}
        <div className="card">
          <div className="card-header">
            <h3>Employee Summary</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/employees')}>
              View All
            </button>
          </div>
          <div className="table-container">
            {employees.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <p>No employees added yet</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Present</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 5).map((emp) => (
                    <tr key={emp.employee_id}>
                      <td>
                        <span className="employee-link" onClick={() => navigate(`/employees/${emp.employee_id}`)}>
                          {emp.full_name}
                        </span>
                      </td>
                      <td><span className="badge badge-dept">{emp.department}</span></td>
                      <td>{emp.total_present} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Attendance</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/attendance')}>
              View All
            </button>
          </div>
          <div className="table-container">
            {recentAttendance.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <p>No attendance records yet</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.map((att) => (
                    <tr key={att.id}>
                      <td>{att.employee_name || att.employee_id}</td>
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
