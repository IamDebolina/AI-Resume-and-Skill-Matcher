import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { resumeService } from '../services/resumeService'

export default function ResumeUpload({ onUpload }) {
  const [drag, setDrag] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const upload = useCallback(async (file) => {
    if (!file?.name?.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported')
      return
    }
    setLoading(true)
    setError('')
    setProgress(0)
    try {
      await resumeService.upload(file, (p) => setProgress(p * 100))
      onUpload?.()
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }, [onUpload])

  const onDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm"
    >
      <h3 className="font-semibold mb-4">Upload Resume (PDF)</h3>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
          drag ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {loading ? (
          <div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-primary-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading... {Math.round(progress)}%</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop your PDF here</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">or</p>
            <label className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700">
              Browse
              <input type="file" accept=".pdf" onChange={onFileChange} className="hidden" />
            </label>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
    </motion.div>
  )
}
