import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { getEmployees, createEmployee, deleteEmployee } from '../services/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const navigate = useNavigate()

  const fetchEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getEmployees()
      setEmployees(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleDelete = async () => {
    try {
      await deleteEmployee(deleteTarget.employee_id)
      toast.success(`Employee "${deleteTarget.full_name}" deleted`)
      setDeleteTarget(null)
      fetchEmployees()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete employee')
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2>Employees</h2>
          <p>Manage your employee directory</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading employees..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEmployees} />
      ) : employees.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No employees yet"
            message="Add your first employee to get started"
          />
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Present Days</th>
                  <th>Absent Days</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.employee_id}>
                    <td style={{ fontWeight: 500 }}>{emp.employee_id}</td>
                    <td>
                      <span className="employee-link" onClick={() => navigate(`/employees/${emp.employee_id}`)}>
                        {emp.full_name}
                      </span>
                    </td>
                    <td>{emp.email}</td>
                    <td><span className="badge badge-dept">{emp.department}</span></td>
                    <td><span className="badge badge-present">{emp.total_present}</span></td>
                    <td><span className="badge badge-absent">{emp.total_absent}</span></td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteTarget(emp)}
                        title="Delete employee"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchEmployees()
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Employee"
          message={`Are you sure you want to delete "${deleteTarget.full_name}" (${deleteTarget.employee_id})? This will also remove all their attendance records.`}
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

function AddEmployeeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required'
    if (!form.full_name.trim()) errs.full_name = 'Full name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.department.trim()) errs.department = 'Department is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await createEmployee(form)
      toast.success(`Employee "${form.full_name}" added successfully`)
      onSuccess()
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        toast.error(detail)
      } else if (Array.isArray(detail)) {
        toast.error(detail.map(d => d.msg).join(', '))
      } else {
        toast.error('Failed to add employee')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  return (
    <Modal title="Add New Employee" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              placeholder="e.g. EMP001"
              value={form.employee_id}
              onChange={handleChange('employee_id')}
              className={errors.employee_id ? 'error' : ''}
            />
            {errors.employee_id && <span className="form-error">{errors.employee_id}</span>}
          </div>
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              placeholder="e.g. Engineering"
              value={form.department}
              onChange={handleChange('department')}
              className={errors.department ? 'error' : ''}
            />
            {errors.department && <span className="form-error">{errors.department}</span>}
          </div>
          <div className="form-group full-width">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={form.full_name}
              onChange={handleChange('full_name')}
              className={errors.full_name ? 'error' : ''}
            />
            {errors.full_name && <span className="form-error">{errors.full_name}</span>}
          </div>
          <div className="form-group full-width">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. john@company.com"
              value={form.email}
              onChange={handleChange('email')}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Employee'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
