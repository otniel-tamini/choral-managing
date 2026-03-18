import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const choristeService = {
  getAll: (params) => api.get('/choristes', { params }),
  getById: (id) => api.get(`/choristes/${id}`),
  create: (data) => api.post('/choristes', data),
  update: (id, data) => api.put(`/choristes/${id}`, data),
  delete: (id) => api.delete(`/choristes/${id}`)
}

export const cotisationService = {
  getAll: (params) => api.get('/cotisations', { params }),
  getHistorique: (choristeId) => api.get(`/cotisations/chronique/${choristeId}`),
  getByMois: (annee, mois) => api.get(`/cotisations/mois/${annee}/${mois}`),
  getByAnnee: (annee) => api.get(`/cotisations/annee/${annee}`),
  create: (data) => api.post('/cotisations', data),
  update: (id, data) => api.put(`/cotisations/${id}`, data),
  delete: (id) => api.delete(`/cotisations/${id}`)
}

export const donService = {
  getAll: (params) => api.get('/dons', { params }),
  create: (data) => api.post('/dons', data),
  update: (id, data) => api.put(`/dons/${id}`, data),
  delete: (id) => api.delete(`/dons/${id}`)
}

export const depenseService = {
  getAll: (params) => api.get('/depenses', { params }),
  create: (data) => api.post('/depenses', data),
  update: (id, data) => api.put(`/depenses/${id}`, data),
  delete: (id) => api.delete(`/depenses/${id}`)
}

export const dashboardService = {
  getStats: () => api.get('/dashboard'),
  getEvolution: (annee) => api.get('/dashboard/evolution', { params: { annee } })
}

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

export const exportService = {
  exportExcel: (type, annee) => `${API_URL}/export/excel/${type}?annee=${annee}`
}

export default api
