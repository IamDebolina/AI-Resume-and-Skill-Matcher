import { useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { resumeService } from '../services/resumeService'
import { jobService } from '../services/jobService'

export default function JobMatching() {
  const [jobDesc, setJobDesc] = useState('')
  const [matches, setMatches] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [jobsLoading, setJobsLoading] = useState(false)

  const runMatch = async () => {
    if (!jobDesc.trim()) return
    setLoading(true)
    try {
      const { data } = await resumeService.matchJob(jobDesc)
      setMatches(data ?? [])
    } catch {
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    setJobsLoading(true)
    try {
      const { data } = await jobService.latest()
      setJobs(data?.jobs ?? [])
    } catch {
      setJobs([])
    } finally {
      setJobsLoading(false)
    }
  }

  return (
    <Layout title="Job Matching">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
          <h3 className="font-semibold mb-4">Match resumes to job description</h3>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste job description..."
            className="w-full h-32 px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 mb-4"
          />
          <button
            onClick={runMatch}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Matching...' : 'Get Match Scores'}
          </button>
        </div>

        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden"
          >
            <h3 className="font-semibold p-4">Ranked Resumes</h3>
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3">Resume</th>
                  <th className="text-left px-4 py-3">Job Fit Score</th>
                  <th className="text-left px-4 py-3">Semantic</th>
                  <th className="text-left px-4 py-3">Skill Match</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={m.resume_id} className="border-t dark:border-gray-700">
                    <td className="px-4 py-3">{m.filename}</td>
                    <td className="px-4 py-3 font-semibold">{m.job_fit_score}%</td>
                    <td className="px-4 py-3 text-sm">{(m.semantic_similarity * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm">{(m.skill_match_ratio * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Latest Jobs</h3>
            <button
              onClick={fetchJobs}
              disabled={jobsLoading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
            >
              {jobsLoading ? 'Loading...' : 'Load Jobs'}
            </button>
          </div>
          {jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.slice(0, 10).map((j) => (
                <div
                  key={j.title + j.company}
                  className="p-4 rounded-lg border dark:border-gray-600"
                >
                  <p className="font-medium">{j.title} @ {j.company}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{j.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {j.skills?.slice(0, 5).map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Click "Load Jobs" to fetch sample jobs.</p>
          )}
        </div>
      </div>
    </Layout>
  )
}
