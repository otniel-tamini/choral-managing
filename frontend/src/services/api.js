import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// Response interceptor to handle 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data)
}

// Choristes
export const choristeService = {
  getAll: (params) => api.get('/choristes', { params }),
  getById: (id) => api.get(`/choristes/${id}`),
  create: (data) => api.post('/choristes', data),
  update: (id, data) => api.put(`/choristes/${id}`, data),
  delete: (id) => api.delete(`/choristes/${id}`)
}

// Cotisations
export const cotisationService = {
  getAll: (params) => api.get('/cotisations', { params }),
  getHistorique: (choristeId) => api.get(`/cotisations/chronique/${choristeId}`),
  getByMois: (annee, mois) => api.get(`/cotisations/mois/${annee}/${mois}`),
  getByAnnee: (annee) => api.get(`/cotisations/annee/${annee}`),
  create: (data) => api.post('/cotisations', data),
  update: (id, data) => api.put(`/cotisations/${id}`, data),
  delete: (id) => api.delete(`/cotisations/${id}`)
}

// Dons
export const donService = {
  getAll: (params) => api.get('/dons', { params }),
  create: (data) => api.post('/dons', data),
  update: (id, data) => api.put(`/dons/${id}`, data),
  delete: (id) => api.delete(`/dons/${id}`)
}

// Dépenses
export const depenseService = {
  getAll: (params) => api.get('/depenses', { params }),
  create: (data) => api.post('/depenses', data),
  update: (id, data) => api.put(`/depenses/${id}`, data),
  delete: (id) => api.delete(`/depenses/${id}`)
}

// Dashboard
export const dashboardService = {
  getStats: () => api.get('/dashboard'),
  getEvolution: (annee) => api.get('/dashboard/evolution', { params: { annee } })
}

// Rapports
export const rapportService = {
  getTrimestriel: (annee, trimestre, format) => 
    api.get(`/rapports/trimestriel/${annee}/${trimestre}`, { 
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json'
    }),
  getAnnuel: (annee, format) => 
    api.get(`/rapports/annuel/${annee}`, { 
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json'
    })
}

// Programmation
export const programmationService = {
  getByRange: (startDate, endDate) => api.get('/programmation/range', { params: { startDate, endDate } }),
  createOrUpdate: (data) => api.post('/programmation', data),
  delete: (id) => api.delete(`/programmation/${id}`),
  exportPDF: (startDate, endDate) => `${API_URL}/programmation/export-pdf?startDate=${startDate}&endDate=${endDate}`
}

// Export
export const exportService = {
  exportExcel: (type, annee) => `${API_URL}/export/excel/${type}?annee=${annee}`
}

export default api
