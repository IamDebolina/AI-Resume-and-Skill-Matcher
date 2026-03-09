import { api } from './api'

export const resumeService = {
  list: () => api.get('/resume/list'),
  get: (id) => api.get(`/resume/${id}`),

  upload: (file, onProgress) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/resume/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(e.loaded / e.total * 100),
    })
  },

  matchJob: (jobDescriptionText) =>
    api.post('/match/job-description', { job_description_text: jobDescriptionText }),

  skillGap: (resumeText, jobDescriptionText) =>
    api.post('/skills/gap', { resume_text: resumeText, job_description_text: jobDescriptionText }),

  atsCheck: (resumeText, jobDescriptionText) =>
    api.post('/resume/ats-check', { resume_text: resumeText, job_description_text: jobDescriptionText }),

  rewrite: (bulletPoints) =>
    api.post('/resume/rewrite', { bullet_points: bulletPoints }),
}
