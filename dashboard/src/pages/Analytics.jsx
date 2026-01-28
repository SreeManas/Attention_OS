import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fetchSessions } from '../utils/api'
import { calculateStats, formatTime } from '../utils/helpers'
import FocusDNA from '../components/FocusDNA'
import FocusDNA3D from '../components/FocusDNA3D'
import EmptyState from '../components/EmptyState'

// Animated number counter
function AnimatedNumber({ value, suffix = '' }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        const target = parseFloat(value) || 0
        const duration = 1200
        const steps = 40
        const increment = target / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                setDisplayValue(target)
                clearInterval(timer)
            } else {
                setDisplayValue(current)
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [value])

    return <>{Math.round(displayValue)}{suffix}</>
}

// Story insight with emotion
function StoryInsight({ emoji, headline, detail, color = 'var(--color-accent)', delay = 0 }) {
    return (
        <motion.div
            className="insight-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, duration: 0.5 }}
            style={{ '--accent-color': color }}
        >
            <div className="insight-emoji">{emoji}</div>
            <div className="insight-text">{headline}</div>
            <div className="insight-detail">{detail}</div>
        </motion.div>
    )
}

function Analytics() {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSessions()
            .then(data => {
                setSessions(data)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <motion.div
                className="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="loading-spinner" />
                <p>Crunching the numbers...</p>
            </motion.div>
        )
    }

    if (sessions.length === 0) {
        return (
            <EmptyState
                icon="📈"
                title="No analytics data yet"
                description="Complete a few sessions to unlock insights about your productivity patterns, trends, and focus behaviors."
            />
        )
    }

    const stats = calculateStats(sessions)
    const recentSessions = sessions.slice(0, 10).reverse()

    // Trend analysis
    const isImproving = recentSessions.length >= 3 &&
        recentSessions[recentSessions.length - 1].focus_score > recentSessions[0].focus_score

    // Average session length
    const avgDuration = sessions.reduce((sum, s) => sum + s.total_active_seconds + s.total_idle_seconds, 0) / sessions.length

    // Find patterns
    const avgSwitches = sessions.reduce((sum, s) => sum + s.app_switches, 0) / sessions.length

    // Chart data
    const focusTrendData = recentSessions.map((session, index) => ({
        name: `#${sessions.length - recentSessions.length + index + 1}`,
        focus: Math.round(session.focus_score),
        active: Math.round(session.total_active_seconds / 60),
        idle: Math.round(session.total_idle_seconds / 60),
        switches: session.app_switches
    }))

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                className="page-header"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="page-eyebrow">Insights</div>
                <h1 className="page-title">Analytics</h1>
                <p className="page-subtitle">Understand your productivity patterns</p>
            </motion.div>

            {/* Key Stats */}
            <div className="stats-grid">
                <motion.div
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon">📊</div>
                    <div className="stat-value"><AnimatedNumber value={stats.totalSessions} /></div>
                    <div className="stat-label">Total Sessions</div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon">🎯</div>
                    <div className="stat-value"><AnimatedNumber value={stats.avgFocusScore} suffix="%" /></div>
                    <div className="stat-label">Average Focus</div>
                    {isImproving && (
                        <div className="stat-trend">↑ Improving</div>
                    )}
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-value">{formatTime(Math.round(stats.avgActiveTime))}</div>
                    <div className="stat-label">Avg Active Time</div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="stat-icon">🏆</div>
                    <div className="stat-value"><AnimatedNumber value={stats.bestSession?.focus_score || 0} suffix="%" /></div>
                    <div className="stat-label">Best Focus Score</div>
                </motion.div>
            </div>

            {/* Story Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StoryInsight
                    emoji={isImproving ? "📈" : "📉"}
                    headline={isImproving ? "Your focus is improving!" : "Room for improvement"}
                    detail={`Average score: ${stats.avgFocusScore.toFixed(0)}% across ${stats.totalSessions} sessions`}
                    delay={0.5}
                />

                <StoryInsight
                    emoji="🔄"
                    headline={`~${Math.round(avgSwitches)} app switches per session`}
                    detail={avgSwitches > 20 ? "Try batching similar tasks to reduce context switching" : "Good context discipline!"}
                    delay={0.6}
                />
            </div>

            {/* 3D Focus DNA Helix */}
            <div style={{ marginBottom: '2rem' }}>
                <FocusDNA3D sessions={sessions} />
            </div>

            {/* Focus Trend Chart */}
            <motion.div
                className="chart-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <div className="chart-header">
                    <div>
                        <div className="chart-title">Focus Score Over Time</div>
                        <div className="chart-subtitle">Tracking your concentration levels</div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={focusTrendData}>
                        <defs>
                            <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                fontSize: '13px',
                                color: '#fff'
                            }}
                            formatter={(value) => [`${value}%`, 'Focus']}
                        />
                        <Area
                            type="monotone"
                            dataKey="focus"
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            fill="url(#focusGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Activity Breakdown Chart */}
            <motion.div
                className="chart-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <div className="chart-header">
                    <div>
                        <div className="chart-title">Active vs Idle Time</div>
                        <div className="chart-subtitle">Minutes per session</div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={focusTrendData}>
                        <XAxis
                            dataKey="name"
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                fontSize: '13px',
                                color: '#fff'
                            }}
                            formatter={(value, name) => [`${value} min`, name === 'active' ? 'Active' : 'Idle']}
                        />
                        <Bar dataKey="active" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="idle" fill="#374151" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* App Switches Trend */}
            <motion.div
                className="chart-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
            >
                <div className="chart-header">
                    <div>
                        <div className="chart-title">Context Switches</div>
                        <div className="chart-subtitle">App switches per session</div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={focusTrendData}>
                        <XAxis
                            dataKey="name"
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.2)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                fontSize: '13px',
                                color: '#fff'
                            }}
                            formatter={(value) => [value, 'Switches']}
                        />
                        <Line
                            type="monotone"
                            dataKey="switches"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ fill: '#f59e0b', r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>
        </motion.div>
    )
}

export default Analytics
