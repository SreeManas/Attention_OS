import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fetchSessions } from '../utils/api'
import { formatTime } from '../utils/helpers'
import FocusPulse from '../components/FocusPulse'
import SessionWrap from '../components/SessionWrap'
import EmptyState from '../components/EmptyState'
import AchievementShelf from '../components/AchievementShelf'
import AIBubble from '../components/AIBubble'

// Animated counter component
function AnimatedNumber({ value, suffix = '' }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        const target = parseFloat(value) || 0
        const duration = 1500
        const steps = 60
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



// Insight card with emotion
function InsightCard({ emoji, text, detail, delay = 0 }) {
    return (
        <motion.div
            className="insight-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="insight-emoji">{emoji}</div>
            <div className="insight-text">{text}</div>
            {detail && <div className="insight-detail">{detail}</div>}
        </motion.div>
    )
}

// Stat card with animation
function StatCard({ icon, value, label, delay = 0 }) {
    return (
        <motion.div
            className="stat-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{typeof value === 'number' ? <AnimatedNumber value={value} /> : value}</div>
            <div className="stat-label">{label}</div>
        </motion.div>
    )
}

function Dashboard() {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showWrap, setShowWrap] = useState(false)

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
                <p>Analyzing your focus...</p>
            </motion.div>
        )
    }

    if (sessions.length === 0) {
        return (
            <EmptyState
                icon="🧠"
                title="Your focus journey starts here"
                description="Start tracking your first session to discover insights about your productivity patterns and build better focus habits."
            />
        )
    }

    const latestSession = sessions[0]
    const recentSessions = sessions.slice(0, 7).reverse()

    // Calculate averages
    const avgFocusScore = sessions.reduce((sum, s) => sum + s.focus_score, 0) / sessions.length
    const totalActiveTime = sessions.reduce((sum, s) => sum + s.total_active_seconds, 0)

    // Chart data
    const focusTrendData = recentSessions.map((session, index) => ({
        name: `Session ${sessions.length - recentSessions.length + index + 1}`,
        focus: Math.round(session.focus_score),
        active: Math.round(session.total_active_seconds / 60),
    }))

    // Generate insight text based on data
    const getInsight = () => {
        if (latestSession.focus_score >= 80) {
            return { emoji: '🔥', text: `You were deeply focused for ${formatTime(latestSession.total_active_seconds)}`, detail: 'Exceptional focus session. Keep this momentum!' }
        } else if (latestSession.focus_score >= 60) {
            return { emoji: '✨', text: `Good focus session with ${latestSession.app_switches} app switches`, detail: 'Room for improvement, but solid work.' }
        } else {
            return { emoji: '💭', text: `High context switching detected (${latestSession.app_switches} switches)`, detail: 'Try blocking distracting apps during deep work.' }
        }
    }

    const insight = getInsight()

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Page Header */}
                <motion.div
                    className="page-header"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="page-eyebrow">Today's Overview</div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Your focus command center</p>

                    {/* Demo button to trigger Session Wrap */}
                    <motion.button
                        onClick={() => setShowWrap(true)}
                        className="demo-session-wrap-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        🎉 Preview Session Wrap
                    </motion.button>
                </motion.div>

                {/* HERO: Focus Pulse - The Signature Feature */}
                <FocusPulse session={latestSession} sessions={sessions} />

                {/* Achievement Shelf */}
                <AchievementShelf sessions={sessions} />

                {/* Insight Card */}
                <div style={{ marginBottom: '2rem' }}>
                    <InsightCard
                        emoji={insight.emoji}
                        text={insight.text}
                        detail={insight.detail}
                        delay={0.4}
                    />
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <StatCard
                        icon="⏱️"
                        value={formatTime(latestSession.total_active_seconds)}
                        label="Active Time"
                        delay={0.5}
                    />
                    <StatCard
                        icon="💤"
                        value={formatTime(latestSession.total_idle_seconds)}
                        label="Idle Time"
                        delay={0.6}
                    />
                    <StatCard
                        icon="🔄"
                        value={latestSession.app_switches}
                        label="App Switches"
                        delay={0.7}
                    />
                    <StatCard
                        icon="📊"
                        value={sessions.length}
                        label="Total Sessions"
                        delay={0.8}
                    />
                </div>

                {/* Focus Trend Chart */}
                <motion.div
                    className="chart-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                >
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Focus Score Trend</div>
                            <div className="chart-subtitle">Last {recentSessions.length} sessions</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={focusTrendData}>
                            <defs>
                                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
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

                {/* Activity Chart */}
                <motion.div
                    className="chart-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                >
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Active Minutes</div>
                            <div className="chart-subtitle">Time spent focused per session</div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
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
                                formatter={(value) => [`${value} min`, 'Active']}
                            />
                            <Bar
                                dataKey="active"
                                fill="#8b5cf6"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </motion.div>

            {/* Session Wrap Modal */}
            <SessionWrap
                session={latestSession}
                show={showWrap}
                onClose={() => setShowWrap(false)}
            />

            {/* Floating AI Assistant Bubble */}
            <AIBubble />
        </AnimatePresence>
    )
}

export default Dashboard
