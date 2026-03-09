import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 dark:from-slate-950 dark:via-primary-950 dark:to-slate-950">
      <nav className="flex justify-between items-center px-8 py-6">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-white"
        >
          AI Recruitment
        </motion.span>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <Link
            to="/login"
            className="px-4 py-2 text-white/90 hover:text-white transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur"
          >
            Get Started
          </Link>
        </motion.div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 pt-24 pb-32 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold text-white mb-6"
        >
          Match Resumes to Jobs with AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-white/80 mb-12"
        >
          Upload your resume, get skill gap analysis, ATS optimization, and job fit scores.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold text-white transition shadow-lg"
          >
            Start Free
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
