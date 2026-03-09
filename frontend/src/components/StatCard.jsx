import { motion } from 'framer-motion'

export default function StatCard({ title, value, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </motion.div>
  )
}
