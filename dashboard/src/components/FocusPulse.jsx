import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import FocusCore from './FocusCore'

// Health state calculator — Apple aesthetic (purple/indigo only)
const getHealthState = (score) => {
    // All states use purple/indigo gradient — no more green/red/orange
    // Only the emoji and text change
    const baseColors = {
        color1: '#8b5cf6', // purple-500
        color2: '#6366f1', // indigo-500
    }

    if (score >= 85) return {
        ...baseColors,
        status: 'Thriving',
        statusEmoji: '⚡',
        description: 'Peak performance mode'
    }
    if (score >= 70) return {
        ...baseColors,
        status: 'Focused',
        statusEmoji: '🎯',
        description: 'Strong concentration'
    }
    if (score >= 50) return {
        ...baseColors,
        status: 'Steady',
        statusEmoji: '✨',
        description: 'Maintaining balance'
    }
    if (score >= 30) return {
        ...baseColors,
        status: 'Building',
        statusEmoji: '🌱',
        description: 'Room for growth'
    }
    return {
        ...baseColors,
        status: 'Starting',
        statusEmoji: '🔮',
        description: 'Focus journey begins'
    }
}

// Animated number counter
function AnimatedCounter({ value, suffix = '' }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const target = parseFloat(value) || 0
        const duration = 1500
        const steps = 60
        const increment = target / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(current)
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [value])

    return <>{Math.round(count)}{suffix}</>
}

// 3D Focus Core Reactor - Holographic arc reactor style
function PulseOrb({ healthScore }) {
    return (
        <div className="pulse-orb-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <FocusCore focusScore={healthScore} />
        </div>
    )
}

function PulseStats({ healthScore, streak, trend, status, description }) {
    return (
        <motion.div
            className="pulse-stats"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
        >
            <div className="pulse-status">
                <span className="pulse-status-emoji">{status.statusEmoji}</span>
                <span className="pulse-status-text">{status.status}</span>
            </div>

            <p className="pulse-description">{status.description}</p>

            <div className="pulse-metrics">
                <div className="pulse-metric">
                    <div className="pulse-metric-label">Health Score</div>
                    <div className="pulse-metric-value">
                        <AnimatedCounter value={healthScore} suffix="%" />
                    </div>
                </div>

                <div className="pulse-metric">
                    <div className="pulse-metric-label">Focus Streak</div>
                    <div className="pulse-metric-value">
                        {streak > 0 ? (
                            <>{streak} {streak === 1 ? 'day' : 'days'}</>
                        ) : (
                            '—'
                        )}
                    </div>
                </div>

                {trend !== 0 && (
                    <div className="pulse-metric">
                        <div className="pulse-metric-label">vs Average</div>
                        <div className="pulse-metric-value" style={{
                            color: trend > 0 ? '#8b5cf6' : '#6b7280'
                        }}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </div>
                    </div>
                )}
            </div>

            {/* Health bar */}
            <div className="pulse-health-bar">
                <div className="pulse-health-bar-label">
                    <span>Focus Health</span>
                    <span>{Math.round(healthScore)}%</span>
                </div>
                <div className="pulse-health-bar-track">
                    <motion.div
                        className="pulse-health-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${healthScore}%` }}
                        transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            background: `linear-gradient(90deg, ${status.color1}, ${status.color2})`
                        }}
                    />
                </div>
            </div>
        </motion.div>
    )
}

export default function FocusPulse({ session, sessions = [] }) {
    // Calculate health score
    const healthScore = session?.focus_score || 0

    // Calculate streak (consecutive days with sessions)
    const calculateStreak = () => {
        if (sessions.length === 0) return 0

        let streak = 1
        const today = new Date().setHours(0, 0, 0, 0)

        for (let i = 0; i < sessions.length - 1; i++) {
            const current = new Date(sessions[i].start_time).setHours(0, 0, 0, 0)
            const next = new Date(sessions[i + 1].start_time).setHours(0, 0, 0, 0)
            const dayDiff = (current - next) / (1000 * 60 * 60 * 24)

            if (dayDiff === 1) {
                streak++
            } else {
                break
            }
        }

        return streak
    }

    // Calculate trend vs average
    const calculateTrend = () => {
        if (sessions.length < 2) return 0
        const avgScore = sessions.reduce((sum, s) => sum + s.focus_score, 0) / sessions.length
        return Math.round(healthScore - avgScore)
    }

    const streak = calculateStreak()
    const trend = calculateTrend()
    const state = getHealthState(healthScore)

    return (
        <motion.div
            className="focus-pulse-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="focus-pulse-header">
                <div className="pulse-eyebrow">Live Focus Health</div>
                <h2 className="pulse-title">Your Focus Pulse</h2>
            </div>

            <div className="focus-pulse-content">
                <PulseOrb healthScore={healthScore} />
                <PulseStats
                    healthScore={healthScore}
                    streak={streak}
                    trend={trend}
                    status={state}
                    description={state.description}
                />
            </div>
        </motion.div>
    )
}
