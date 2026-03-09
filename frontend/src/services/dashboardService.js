import { api } from './api'

export const dashboardService = {
  user: () => api.get('/dashboard/user'),
  admin: () => api.get('/dashboard/admin'),
}
