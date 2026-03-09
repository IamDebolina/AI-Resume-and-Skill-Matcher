import { motion } from 'framer-motion'

export default function ResumeTable({ resumes }) {
  if (!resumes?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-8 text-center text-gray-500">
        No resumes yet. Upload one above.
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden"
    >
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Filename</th>
            <th className="text-left px-4 py-3 font-medium">Skills</th>
            <th className="text-left px-4 py-3 font-medium">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {resumes.map((r, i) => (
            <motion.tr
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td className="px-4 py-3">{r.filename}</td>
              <td className="px-4 py-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {r.skills_count ?? r.skills?.length ?? 0} skills
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {r.upload_date ? new Date(r.upload_date).toLocaleDateString() : '-'}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
