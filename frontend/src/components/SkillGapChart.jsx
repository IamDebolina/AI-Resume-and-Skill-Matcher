import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function SkillGapChart({ matched = [], missing = [] }) {
  const data = [
    { name: 'Matched', value: matched.length, fill: COLORS[1] },
    { name: 'Missing', value: missing.length, fill: COLORS[3] },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 h-64 flex items-center justify-center text-gray-500">
        Add a job description to see skill gap
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6"
    >
      <h3 className="font-semibold mb-4">Skill Gap</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
              {data.map((_, i) => (
                <Cell key={i} fill={data[i].fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-2 text-sm">
        <span className="text-green-600">Matched: {matched.length}</span>
        <span className="text-red-600">Missing: {missing.length}</span>
      </div>
    </motion.div>
  )
}
