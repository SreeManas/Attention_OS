import { motion, AnimatePresence } from 'framer-motion'
import { formatTime } from '../utils/helpers'

// Calculate grade based on metrics
function calculateGrade(sessions) {
    const todaysSessions = sessions.filter(s =>
        new Date(s.start_time).toDateString() === new Date().toDateString()
    )

    if (todaysSessions.length === 0) return { grade: 'N/A', score: 0 }

    const avgFocus = todaysSessions.reduce((sum, s) => sum + s.focus_score, 0) / todaysSessions.length
    const totalActive = todaysSessions.reduce((sum, s) => sum + s.total_active_seconds, 0)
    const avgSwitches = todaysSessions.reduce((sum, s) => sum + s.app_switches, 0) / todaysSessions.length

    let score = avgFocus * 0.5 // 50% weight on focus
    score += Math.min((totalActive / 14400) * 100, 100) * 0.3 // 30% weight on 4+ hours active
    score += Math.max(100 - avgSwitches * 2, 0) * 0.2 // 20% weight on low switches

    if (score >= 90) return { grade: 'A+', score, color: '#10b981' }
    if (score >= 85) return { grade: 'A', score, color: '#10b981' }
    if (score >= 80) return { grade: 'A-', score, color: '#14b8a6' }
    if (score >= 75) return { grade: 'B+', score, color: '#6366f1' }
    if (score >= 70) return { grade: 'B', score, color: '#8b5cf6' }
    if (score >= 65) return { grade: 'B-', score, color: '#a855f7' }
    if (score >= 60) return { grade: 'C+', score, color: '#f59e0b' }
    if (score >= 55) return { grade: 'C', score, color: '#f59e0b' }
    if (score >= 50) return { grade: 'C-', score, color: '#f59e0b' }
    return { grade: 'D', score, color: '#ef4444' }
}

export default function DailyReport({ sessions, show, onClose }) {
    if (!show) return null

    const todaysSessions = sessions.filter(s =>
        new Date(s.start_time).toDateString() === new Date().toDateString()
    )

    const { grade, score, color } = calculateGrade(sessions)

    const totalActive = todaysSessions.reduce((sum, s) => sum + s.total_active_seconds, 0)
    const totalIdle = todaysSessions.reduce((sum, s) => sum + s.total_idle_seconds, 0)
    const totalSwitches = todaysSessions.reduce((sum, s) => sum + s.app_switches, 0)
    const avgFocus = todaysSessions.length > 0
        ? todaysSessions.reduce((sum, s) => sum + s.focus_score, 0) / todaysSessions.length
        : 0

    // Generate insight
    const getInsight = () => {
        if (todaysSessions.length === 0) return "No sessions tracked today"
        if (grade.startsWith('A')) return "Outstanding focus today! Keep this momentum going."
        if (grade.startsWith('B')) return "Solid performance. A few tweaks could push you to an A."
        if (grade.startsWith('C')) return "Room for improvement. Try longer focus blocks tomorrow."
        return "Let's aim higher tomorrow. Small changes make big differences."
    }

    return (
        <AnimatePresence>
            <motion.div
                className="daily-report-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="daily-report-card"
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 30 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <motion.div
                        className="report-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="report-eyebrow">Daily Focus Report</div>
                        <div className="report-date">{new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                        })}</div>
                    </motion.div>

                    {/* Grade */}
                    <motion.div
                        className="report-grade-section"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <div className="report-grade" style={{ color }}>
                            {grade}
                        </div>
                        <div className="report-grade-label">Today's Grade</div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="report-stats"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="report-stat">
                            <div className="report-stat-value">{todaysSessions.length}</div>
                            <div className="report-stat-label">Sessions</div>
                        </div>
                        <div className="report-stat">
                            <div className="report-stat-value">{Math.round(avgFocus)}%</div>
                            <div className="report-stat-label">Avg Focus</div>
                        </div>
                        <div className="report-stat">
                            <div className="report-stat-value">{formatTime(totalActive)}</div>
                            <div className="report-stat-label">Active Time</div>
                        </div>
                        <div className="report-stat">
                            <div className="report-stat-value">{totalSwitches}</div>
                            <div className="report-stat-label">App Switches</div>
                        </div>
                    </motion.div>

                    {/* Insight */}
                    <motion.div
                        className="report-insight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="report-insight-icon">💡</div>
                        <p className="report-insight-text">{getInsight()}</p>
                    </motion.div>

                    {/* Close Button */}
                    <motion.button
                        className="btn-primary"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Got it!
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
