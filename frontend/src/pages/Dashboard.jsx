import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import ResumeUpload from '../components/ResumeUpload'
import ResumeTable from '../components/ResumeTable'
import StatCard from '../components/StatCard'
import SkillGapChart from '../components/SkillGapChart'
import { dashboardService } from '../services/dashboardService'
import { resumeService } from '../services/resumeService'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [skillGap, setSkillGap] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      const { data: d } = await dashboardService.user()
      setData(d)
    } catch {
      setData({ total_resumes: 0, best_match_score: 0, total_skills: 0, resumes: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const runSkillGap = async () => {
    if (!jobDesc.trim() || !data?.resumes?.[0]) return
    try {
      const { data: resume } = await resumeService.get(data.resumes[0].id)
      const { data: r } = await resumeService.skillGap(resume.resume_text, jobDesc)
      setSkillGap(r)
    } catch {
      setSkillGap(null)
    }
  }

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">Loading...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Resumes" value={data?.total_resumes ?? 0} delay={0.1} />
          <StatCard title="Best Match Score" value={`${data?.best_match_score ?? 0}%`} delay={0.2} />
          <StatCard title="Missing Skills" value={skillGap?.missing_skills?.length ?? '-'} delay={0.3} />
          <StatCard title="Recommended Skills" value={skillGap?.recommended_skills?.length ?? '-'} delay={0.4} />
        </div>

        <ResumeUpload onUpload={fetchDashboard} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResumeTable resumes={data?.resumes ?? []} />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Job description for skill gap</label>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste job description..."
                className="w-full h-24 px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={runSkillGap}
                className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Analyze
              </button>
            </div>
            <SkillGapChart
              matched={skillGap?.matched_skills ?? []}
              missing={skillGap?.missing_skills ?? []}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}
