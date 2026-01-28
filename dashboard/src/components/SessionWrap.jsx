import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

// Animated counter for metrics
function CountUpNumber({ value, duration = 1000 }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const target = parseFloat(value) || 0
        const steps = 50
        const increment = target / steps
        const stepDuration = duration / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(current)
            }
        }, stepDuration)

        return () => clearInterval(timer)
    }, [value, duration])

    return Math.round(count)
}

// Circular progress ring
function ProgressRing({ progress, delay = 0 }) {
    const radius = 80
    const stroke = 8
    const normalizedRadius = radius - stroke * 2
    const circumference = normalizedRadius * 2 * Math.PI
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <motion.svg
            height={radius * 2}
            width={radius * 2}
            className="progress-ring"
        >
            {/* Background circle */}
            <circle
                stroke="rgba(255,255,255,0.1)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            {/* Progress circle */}
            <motion.circle
                stroke="#6366f1"
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeDashoffset }}
                transition={{ delay: delay + 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    strokeDasharray: `${circumference} ${circumference}`,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%'
                }}
            />
            {/* Center text */}
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    fill: 'white'
                }}
            >
                <CountUpNumber value={progress} />%
            </text>
        </motion.svg>
    )
}

// Achievement badge
function AchievementBadge({ achievement, delay = 0 }) {
    if (!achievement) return null

    return (
        <motion.div
            className="achievement-badge"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
                delay,
                duration: 0.6,
                type: "spring",
                bounce: 0.5
            }}
        >
            <div className="achievement-icon">{achievement.badge}</div>
            <div className="achievement-text">
                <div className="achievement-title">Achievement Unlocked!</div>
                <div className="achievement-name">{achievement.name}</div>
            </div>
        </motion.div>
    )
}

// Format time helper
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
        return `${hours}h ${minutes}m`
    }
    return `${minutes} min`
}

// Check for achievements
function checkAchievements(session) {
    const achievements = []

    if (session.focus_score >= 90) {
        achievements.push({
            badge: '🎯',
            name: 'Deep Focus Master',
            description: 'Achieved 90%+ focus score'
        })
    }

    if (session.total_active_seconds >= 7200) { // 2 hours
        achievements.push({
            badge: '🏃',
            name: 'Marathon Session',
            description: 'Focused for 2+ hours'
        })
    }

    if (session.app_switches === 0) {
        achievements.push({
            badge: '🧘',
            name: 'Zen Mode',
            description: 'Zero context switches'
        })
    }

    if (session.focus_score >= 80 && session.total_active_seconds >= 3600) {
        achievements.push({
            badge: '⚡',
            name: 'Power Hour',
            description: '80%+ focus for 1+ hour'
        })
    }

    return achievements[0] // Return first achievement
}

export default function SessionWrap({ session, show, onClose }) {
    const [currentScreen, setCurrentScreen] = useState(0)
    const achievement = checkAchievements(session)

    useEffect(() => {
        if (!show) {
            setCurrentScreen(0)
            return
        }

        // Auto-advance through screens
        const timers = [
            setTimeout(() => setCurrentScreen(1), 800),
            setTimeout(() => setCurrentScreen(2), 2000),
            setTimeout(() => setCurrentScreen(3), 3500),
        ]

        // Auto-dismiss after 15 seconds
        const dismissTimer = setTimeout(() => {
            onClose()
        }, 15000)

        return () => {
            timers.forEach(clearTimeout)
            clearTimeout(dismissTimer)
        }
    }, [show, onClose])

    if (!show) return null

    return (
        <AnimatePresence>
            <motion.div
                className="session-wrap-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="session-wrap-card"
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 30 }}
                    transition={{ type: "spring", damping: 25 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <motion.div
                        className="wrap-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1>Session Complete!</h1>
                        <div className="wrap-emoji">🎉</div>
                    </motion.div>

                    {/* Main Metric */}
                    {currentScreen >= 1 && (
                        <motion.div
                            className="wrap-main-metric"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <div className="wrap-metric-label">You focused for</div>
                            <div className="wrap-metric-value">
                                {formatTime(session.total_active_seconds)}
                            </div>
                        </motion.div>
                    )}

                    {/* Focus Score Ring */}
                    {currentScreen >= 2 && (
                        <motion.div
                            className="wrap-progress-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <ProgressRing progress={session.focus_score} delay={0.3} />
                            <div className="wrap-progress-label">Focus Score</div>
                        </motion.div>
                    )}

                    {/* Achievement Badge */}
                    {currentScreen >= 3 && achievement && (
                        <AchievementBadge achievement={achievement} delay={1.8} />
                    )}

                    {/* Stats Breakdown */}
                    {currentScreen >= 3 && (
                        <motion.div
                            className="wrap-stats"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.0 }}
                        >
                            <div className="wrap-stat">
                                <div className="wrap-stat-value">{formatTime(session.total_active_seconds)}</div>
                                <div className="wrap-stat-label">Active</div>
                            </div>
                            <div className="wrap-stat">
                                <div className="wrap-stat-value">{formatTime(session.total_idle_seconds)}</div>
                                <div className="wrap-stat-label">Idle</div>
                            </div>
                            <div className="wrap-stat">
                                <div className="wrap-stat-value">{session.app_switches}</div>
                                <div className="wrap-stat-label">Switches</div>
                            </div>
                        </motion.div>
                    )}

                    {/* CTA Buttons */}
                    {currentScreen >= 3 && (
                        <motion.div
                            className="wrap-actions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.3 }}
                        >
                            <motion.button
                                className="btn-primary"
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Continue
                            </motion.button>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
