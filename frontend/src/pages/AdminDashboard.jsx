import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'
import { dashboardService } from '../services/dashboardService'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.admin()
      .then(({ data }) => setData(data))
      .catch(() => setData({ error: 'Admin access required' }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">Loading...</div>
      </Layout>
    )
  }

  if (data?.error) {
    return (
      <Layout title="Admin Dashboard">
        <p className="text-red-500">{data.error}</p>
      </Layout>
    )
  }

  const chartData = data?.most_popular_skills?.slice(0, 10) ?? []

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6"
          >
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{data?.total_users ?? 0}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6"
          >
            <p className="text-sm text-gray-500">Total Resumes</p>
            <p className="text-2xl font-bold">{data?.total_resumes ?? 0}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6"
          >
            <p className="text-sm text-gray-500">Avg Match Score</p>
            <p className="text-2xl font-bold">{data?.average_job_match_score ?? 0}%</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6"
        >
          <h3 className="font-semibold mb-4">Most Popular Skills</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="skill" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
