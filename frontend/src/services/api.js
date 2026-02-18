import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Employees ──

export const getEmployees = () => api.get('/api/employees/')

export const getEmployee = (id) => api.get(`/api/employees/${id}`)

export const createEmployee = (data) => api.post('/api/employees/', data)

export const deleteEmployee = (id) => api.delete(`/api/employees/${id}`)

// ── Attendance ──

export const getAttendance = (params) => api.get('/api/attendance/', { params })

export const markAttendance = (data) => api.post('/api/attendance/', data)

// ── Dashboard ──

export const getDashboard = () => api.get('/api/dashboard')

export default api
