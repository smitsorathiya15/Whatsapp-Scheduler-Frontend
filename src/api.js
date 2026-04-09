import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

/* Unwrap the standard ResponseHelper envelope */
export const unwrap    = (res) => res.data?.detail?.[0]?.data ?? {}
export const unwrapMsg = (res) => res.data?.detail?.[0]?.msg  ?? 'Done'
export const unwrapError = (err) => {
  const detail = err.response?.data?.detail
  if (Array.isArray(detail)) return detail[0]?.ctx?.reason || detail[0]?.msg || 'Something went wrong.'
  if (typeof detail === 'string') return detail
  return 'Something went wrong.'
}

export const authAPI = {
  register: (data) => api.post('/user/v1/auth/register', data),
  login:    (data) => api.post('/user/v1/auth/login',    data),
  me:       ()     => api.get('/user/v1/auth/me'),
}

export const groupsAPI = {
  list:   ()         => api.get('/user/v1/groups'),
  create: (data)     => api.post('/user/v1/groups', data),
  get:    (id)       => api.get(`/user/v1/groups/${id}`),
  update: (id, data) => api.put(`/user/v1/groups/${id}`, data),
  delete: (id)       => api.delete(`/user/v1/groups/${id}`),
}

export const templatesAPI = {
  list:   ()         => api.get('/user/v1/templates'),
  create: (data)     => api.post('/user/v1/templates', data),
  get:    (id)       => api.get(`/user/v1/templates/${id}`),
  update: (id, data) => api.put(`/user/v1/templates/${id}`, data),
  delete: (id)       => api.delete(`/user/v1/templates/${id}`),
}

export const schedulesAPI = {
  list:   ()         => api.get('/user/v1/schedules'),
  create: (data)     => api.post('/user/v1/schedules', data),
  get:    (id)       => api.get(`/user/v1/schedules/${id}`),
  update: (id, data) => api.put(`/user/v1/schedules/${id}`, data),
  delete: (id)       => api.delete(`/user/v1/schedules/${id}`),
}

export const whatsappAPI = {
  status:   () => api.get('/user/v1/whatsapp/status'),
  qr:       () => api.get('/user/v1/whatsapp/qr'),
  waitScan: () => api.post('/user/v1/whatsapp/wait-scan'),
  unlink:   () => api.post('/user/v1/whatsapp/unlink'),
}

export default api
