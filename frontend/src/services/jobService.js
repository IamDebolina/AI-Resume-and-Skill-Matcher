import { api } from './api'

export const jobService = {
  latest: (url) => api.get('/jobs/latest', { params: url ? { url } : {} }),
}
